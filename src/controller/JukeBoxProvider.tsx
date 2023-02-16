import { useCallback, useEffect, useRef } from "react";

import React, { useContext } from "react";
import {
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { useTracksByName } from "@/util/useTracksByName";
import { useUnmount } from "react-use";

type Data = {
  playJukeBox: () => Promise<void>;
};

const defaultData: Data = {
  playJukeBox: () => Promise.resolve(),
};

type Props = {
  children: React.ReactNode;
};

export const JukeBoxContext = React.createContext<Data>(defaultData);

export const JukeBoxProvider = ({ children }: Props) => {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const existingJukeBoxTracks = useTracksByName("jukebox");

  const audioContext = useRef(new AudioContext());
  const audioElContainer = useRef<HTMLDivElement | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const sink = useRef<MediaStreamAudioDestinationNode | null>(null);

  const cleanup = useRef(() => {
    if (sink.current) sink.current.disconnect();
    if (source.current) source.current.disconnect();
    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current.remove();
    }
  });

  const playJukeBox = useCallback(async () => {
    if (!audioElContainer.current) return;

    cleanup.current();

    audioEl.current = document.createElement("audio");
    audioEl.current.src = "/disco.mp3";
    audioEl.current.autoplay = true;
    audioEl.current.muted = true;
    audioElContainer.current.appendChild(audioEl.current);

    source.current = audioContext.current.createMediaElementSource(
      audioEl.current
    );

    sink.current = audioContext.current.createMediaStreamDestination();
    source.current.connect(sink.current);
    audioEl.current.play();
    localParticipant.publishTrack(sink.current.stream.getAudioTracks()[0], {
      name: "jukebox",
    });
  }, [localParticipant]);

  useEffect(() => {
    console.log("NEIL existingJukeBoxTracks", existingJukeBoxTracks);
  }, [existingJukeBoxTracks]);

  useUnmount(cleanup.current);

  return (
    <JukeBoxContext.Provider value={{ playJukeBox }}>
      {children}
      <div ref={audioElContainer} />
    </JukeBoxContext.Provider>
  );
};

export function useJukeBox() {
  const ctx = useContext(JukeBoxContext);
  if (!ctx) {
    throw "useJukeBox must be used within a WebAudioProvider";
  }
  return ctx;
}
