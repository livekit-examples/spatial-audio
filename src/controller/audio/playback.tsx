"use-client";

import { useRemoteParticipants, useTrack } from "@livekit/components-react";
import { RemoteParticipant, RemoteTrackPublication } from "livekit-client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
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
  const sink = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
    console.log("NEIL player position", position);
  }, [position]);

  useEffect(() => {
    const cleanup = () => {
      if (src.current) {
        src.current.disconnect();
      }
      if (panner.current) {
        panner.current.disconnect();
      }
      if (sink.current) {
        sink.current.disconnect();
      }
    };
    if (!audioContext || !track || !track.mediaStream || !audioEl.current) {
      cleanup();
      return;
    }

    // must attach to audio element for webrtc to play the audio
    track.attach(audioEl.current);

    // create the nodes
    src.current = audioContext.createMediaStreamSource(track.mediaStream);
    panner.current = audioContext.createPanner();
    sink.current = audioContext.createMediaStreamDestination();

    // connect the nodes
    src.current.connect(panner.current);
    panner.current.connect(sink.current);

    audioEl.current.play();

    return cleanup();
  }, [audioContext, track]);

  useEffect(() => {
    publication.setSubscribed(true);
  }, [publication]);

  useEffect(() => {}, []);
  return (
    <>
      <audio
        muted={true}
        ref={(el) => {
          if (!el) return;
          audioEl.current = el;
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
