import { useCallback, useMemo, useRef } from "react";

import React, { useContext } from "react";
import {
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { useUnmount } from "react-use";
import {
  TrackWithIdentity,
  useTracksByName,
} from "@/util/useAudioTracksByName";
import { useWebAudioContext } from "@/providers/audio/webAudio";
import { LocalTrack, LocalTrackPublication, Track } from "livekit-client";

type Data = {
  jukeBoxTrack: TrackWithIdentity | null;
  amIPlayingJukeBox: boolean;
  jukeBoxParticipant: string | null;
  someoneElsePlayingJukeBox: boolean;
  playJukeBox: () => Promise<void>;
  stopJukeBox: () => Promise<void>;
};

const defaultData: Data = {
  jukeBoxTrack: null,
  jukeBoxParticipant: null,
  amIPlayingJukeBox: false,
  someoneElsePlayingJukeBox: false,
  playJukeBox: () => Promise.resolve(),
  stopJukeBox: () => Promise.resolve(),
};

type Props = {
  children: React.ReactNode;
};

export const JukeBoxContext = React.createContext<Data>(defaultData);

export const JukeBoxProvider = ({ children }: Props) => {
  const { localParticipant } = useLocalParticipant();
  const existingJukeBoxTracks = useTracksByName("jukebox");
  const audioContext = useWebAudioContext();

  const audioElContainer = useRef<HTMLDivElement | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const sink = useRef<MediaStreamAudioDestinationNode | null>(null);

  const jukeBoxTrack = useMemo(() => {
    return existingJukeBoxTracks[0] || null;
  }, [existingJukeBoxTracks]);

  const jukeBoxParticipant = useMemo(
    () => jukeBoxTrack?.identity || null,
    [jukeBoxTrack?.identity]
  );

  const amIPlayingJukeBox = useMemo(
    () =>
      existingJukeBoxTracks.findIndex(
        (t) => t.identity === localParticipant.identity
      ) > -1,
    [existingJukeBoxTracks, localParticipant.identity]
  );

  const cleanup = useRef(() => {
    if (sink.current) sink.current.disconnect();
    if (source.current) source.current.disconnect();
    if (audioEl.current) {
      audioEl.current.pause();
      audioEl.current.remove();
    }
  });

  const stopJukeBox = useCallback(async () => {
    cleanup.current();
    const myJukeBoxTracks = existingJukeBoxTracks
      .filter((t) => t.track instanceof LocalTrackPublication && t.track.track)
      .map((t) => t.track.track as LocalTrack);
    myJukeBoxTracks.forEach((t) => localParticipant.unpublishTrack(t));
  }, [existingJukeBoxTracks, localParticipant]);

  const playJukeBox = useCallback(async () => {
    if (!audioElContainer.current) return;

    // Stop any existing jukebox
    await stopJukeBox();

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
      source: Track.Source.Unknown,
    });
  }, [audioContext, localParticipant, stopJukeBox]);

  useUnmount(cleanup.current);

  return (
    <JukeBoxContext.Provider
      value={{
        jukeBoxTrack,
        jukeBoxParticipant,
        amIPlayingJukeBox,
        someoneElsePlayingJukeBox:
          existingJukeBoxTracks.length > 0 && !amIPlayingJukeBox,
        playJukeBox,
        stopJukeBox,
      }}
    >
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
