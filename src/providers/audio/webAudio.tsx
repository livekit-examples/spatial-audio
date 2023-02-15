import React, { useContext } from "react";

type Data = {
  audioContext: AudioContext;
};

const defaultValue: Data = {
  audioContext: new AudioContext(),
};

export const WebAudioContext = React.createContext(defaultValue);

export function useWebAudio() {
  const ctx = useContext(WebAudioContext);
  if (!ctx.audioContext) {
    throw "useWebAudio must be used within a WebAudioProvider";
  }

  return ctx;
}
