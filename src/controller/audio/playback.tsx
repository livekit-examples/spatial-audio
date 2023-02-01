"use-client";

import {
  useRemoteParticipants,
  useRoomContext,
  useTrack,
} from "@livekit/components-react";
import {
  Participant,
  RemoteParticipant,
  RemoteTrackPublication,
} from "livekit-client";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Data = {
  setMyPosition: (position: { x: number; y: number }) => void;
  setPosition: (
    participant: Participant,
    position: { x: number; y: number }
  ) => void;
};

const defaultValue: Data = {
  setPosition: () => null,
  setMyPosition: () => null,
};

const PlaybackContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type RemoteParticipantPlaybackSubscriptionProps = {
  publication: RemoteTrackPublication;
  position: { x: number; y: number };
  myPosition: { x: number; y: number };
};

function RemoteParticipantPlaybackSubscription({
  publication,
  position,
  myPosition,
}: RemoteParticipantPlaybackSubscriptionProps) {
  const { track } = useTrack({ pub: publication });
  const audioEl = useRef<HTMLAudioElement | null>(null);

  const attachEl = useCallback(() => {
    if (!track) return;
    if (!audioEl.current) return;
    track.attach(audioEl.current);
  }, [track]);

  useEffect(() => {
    publication.setSubscribed(true);
  }, [publication]);

  useEffect(() => {}, []);
  return (
    <>
      <audio
        ref={(el) => {
          if (!el) return;
          audioEl.current = el;
          attachEl();
        }}
      />
    </>
  );
}

type RemoteParticipantPlaybackProps = {
  maxHearableDistance: number;
  participant: RemoteParticipant;
  myPosition: { x: number; y: number };
  position: { x: number; y: number };
};

function RemoteParticipantPlayback({
  maxHearableDistance,
  participant,
  myPosition,
  position,
}: RemoteParticipantPlaybackProps) {
  const distance = useMemo(() => {
    const dx = myPosition.x - position.x;
    const dy = myPosition.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [myPosition.x, myPosition.y, position.x, position.y]);

  const [publication, setPublication] = useState<RemoteTrackPublication | null>(
    null
  );

  // TODO: make this distance based
  const hearable = useMemo(() => true, []);

  useEffect(() => {
    const onPublication = (publication: RemoteTrackPublication) => {
      if (publication.kind !== "audio") {
        return;
      }
      setPublication(publication);
    };

    // add existing tracks
    participant.tracks.forEach((pub) => {
      onPublication(pub);
    });

    participant.on("trackPublished", onPublication);

    return () => {
      participant.off("trackPublished", onPublication);
    };
  }, [participant]);

  return (
    <div>
      {hearable && publication && (
        <RemoteParticipantPlaybackSubscription
          publication={publication}
          position={position}
          myPosition={myPosition}
        />
      )}
    </div>
  );
}

type PlaybackProviderProps = {
  maxHearableDistance: number;
  children: React.ReactNode;
};

export function PlaybackProvider({
  children,
  maxHearableDistance,
}: PlaybackProviderProps) {
  const room = useRoomContext();
  const remoteParticipants = useRemoteParticipants({});
  const [myPosition, setMyPosition] = useState<{ x: number; y: number }>({
    x: Infinity,
    y: Infinity,
  });

  // identity -> position map
  const [positions, setPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());

  // initialize or cleanup positions when participants change
  useEffect(() => {
    setPositions((prev) => {
      const existing = new Set(prev);
      const connected = new Set(remoteParticipants.map((p) => p.identity));
      const newPositions = new Map(prev);
      const existingArray = Array.from(existing);
      for (const e in existingArray) {
        if (!connected.has(e)) {
          newPositions.delete(e);
        }
      }

      remoteParticipants.forEach((participant) => {
        newPositions.set(participant.identity, { x: Infinity, y: Infinity });
      });

      return newPositions;
    });
  }, [remoteParticipants, room.participants]);

  // TODO - this will happen very often, we may want to take this out of react-land
  const setPosition = useCallback(
    (participant: Participant, position: { x: number; y: number }) => {
      setPositions((prev) => {
        if (!prev.has(participant.identity)) {
          return prev;
        }
        prev.set(participant.identity, position);
        return new Map(prev);
      });
    },
    []
  );

  return (
    <PlaybackContext.Provider
      value={{
        _provider: true,
        data: { setPosition, setMyPosition },
      }}
    >
      {remoteParticipants.map((rp) => {
        const position = positions.get(rp.identity) || {
          x: Infinity,
          y: Infinity,
        };
        return (
          <RemoteParticipantPlayback
            maxHearableDistance={maxHearableDistance}
            key={rp.identity}
            participant={rp as RemoteParticipant}
            position={position}
            myPosition={myPosition}
          />
        );
      })}
      {children}
    </PlaybackContext.Provider>
  );
}

export function usePlayback() {
  const ctx = useContext(PlaybackContext);
  if (!ctx._provider) {
    throw "usePlayback must be used within a PlaybackProvider";
  }

  return ctx.data;
}
