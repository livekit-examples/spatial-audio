"use-client";

import { useRemoteParticipants, useTrack } from "@livekit/components-react";
import { RemoteParticipant, RemoteTrackPublication } from "livekit-client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUnmount } from "react-use";
import { usePosition } from "../position";
import { useWebAudio } from "./webAudio";

type Data = {};

const defaultValue: Data = {};

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
  const { audioContext } = useWebAudio();

  const src = useRef<MediaStreamAudioSourceNode | null>(null);
  const panner = useRef<PannerNode | null>(null);

  useUnmount(() => {
    if (src.current) {
      src.current.disconnect();
      src.current = null;
    }
    if (panner.current) {
      panner.current.disconnect();
      panner.current = null;
    }
  });

  useEffect(() => {
    if (!panner.current) {
      return;
    }
    const relativePosition = {
      x: position.x - myPosition.x,
      y: position.y - myPosition.y,
    };

    panner.current.positionX.setValueAtTime(relativePosition.x, 0);
    panner.current.positionZ.setValueAtTime(relativePosition.y, 0);
  }, [myPosition.x, myPosition.y, position.x, position.y]);

  useEffect(() => {
    if (
      !audioContext ||
      !track ||
      !track.mediaStream ||
      !audioEl.current ||
      src.current?.mediaStream === track.mediaStream
    ) {
      return;
    }

    audioEl.current.srcObject = track.mediaStream;
    src.current = audioContext.createMediaStreamSource(
      audioEl.current.srcObject as any
    );

    panner.current = audioContext.createPanner();
    panner.current.coneOuterAngle = 360;
    panner.current.coneInnerAngle = 360;
    panner.current.positionX.setValueAtTime(0, 0);
    panner.current.positionY.setValueAtTime(0, 0);
    panner.current.positionZ.setValueAtTime(0, 0);
    panner.current.coneOuterGain = 1;
    panner.current.refDistance = 1;
    panner.current.maxDistance = 100;

    src.current.connect(panner.current).connect(audioContext.destination);
    audioEl.current.play();
    audioEl.current.autoplay = true;
    audioEl.current.muted = false;
    audioEl.current.volume = 0;
  }, [audioContext, track]);

  useEffect(() => {
    publication.setSubscribed(true);
  }, [publication]);

  useEffect(() => {}, []);
  return (
    <>
      <audio muted={true} ref={audioEl} />
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
  const remoteParticipants = useRemoteParticipants({});
  const { playerPositions, myPosition } = usePosition();

  return (
    <PlaybackContext.Provider
      value={{
        _provider: true,
        data: {},
      }}
    >
      {remoteParticipants.map((rp) => {
        const playerPosition = playerPositions.get(rp.identity);
        if (!myPosition || !playerPosition) return null;
        return (
          <RemoteParticipantPlayback
            maxHearableDistance={maxHearableDistance}
            key={rp.identity}
            participant={rp as RemoteParticipant}
            position={playerPosition}
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
