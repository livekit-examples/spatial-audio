import React, { useContext, useEffect, useRef, useState } from "react";

type Data = {
  audioContext: AudioContext | null;
};

const defaultValue: Data = {
  audioContext: null,
};

const WebAudioContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type Props = {
  children: React.ReactNode;
};

export function WebAudioProvider({ children }: Props) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(
    new AudioContext()
  );

  useEffect(() => {
    setAudioContext((prev) => {
      if (prev === null) {
        return new AudioContext();
      }
      return prev;
    });

    return () => {
      setAudioContext((prev) => {
        if (prev !== null) {
          prev.close();
        }
        return null;
      });
    };
  }, []);

  return (
    <WebAudioContext.Provider
      value={{ _provider: true, data: { audioContext } }}
    >
      {children}
    </WebAudioContext.Provider>
  );
}

export function useWebAudio() {
  const ctx = useContext(WebAudioContext);
  if (!ctx._provider) {
    throw "useWebAudio must be used within a WebAudioProvider";
  }

  return ctx.data;
}
