import { useCallback, useEffect, useRef } from "react";

import React, { useContext } from "react";
import {
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { useUnmount } from "react-use";
import { useTracksByName } from "@/util/useAudioTracksByName";
import { useWebAudioContext } from "@/providers/audio/webAudio";

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
  const audioContext = useWebAudioContext();

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

    audioEl.current = new Audio("/disco.mp3");
    audioEl.current.setAttribute("muted", "false");
    audioEl.current.setAttribute("loop", "true");
    audioEl.current.setAttribute("autoplay", "true");
    audioElContainer.current.appendChild(audioEl.current);
    source.current = audioContext.createMediaElementSource(audioEl.current);
    sink.current = audioContext.createMediaStreamDestination();
    source.current.connect(sink.current);
    localParticipant.publishTrack(sink.current.stream.getAudioTracks()[0], {
      name: "jukebox",
    });
  }, [audioContext, localParticipant]);

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
