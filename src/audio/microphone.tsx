import { useMediaDevices } from "@livekit/components-react";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useWebAudio } from "./webAudio";

type SelectMicrophoneFn = (index: number) => void;

type Data = {
  microphones: MicrophoneSelection[];
  selectedMicrophoneIndex: number;
  muted: boolean;

  setMuted: (muted: boolean) => void;
  selectMicrophone: SelectMicrophoneFn;
};

type WebAudioMicSineWave = {
  type: "sine";
};

type WebAudioMic = WebAudioMicSineWave;

type MicrophoneSelection = {
  name: string;
  id: string;
  microphone: MediaDeviceInfo | WebAudioMic;
};

const defaultValue: Data = {
  microphones: [],
  selectedMicrophoneIndex: -1,
  muted: true,

  setMuted: () => null,
  selectMicrophone: () => null,
};

const MicrophoneContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type Props = {
  children: React.ReactNode;
};

export function MicrophoneProvider({ children }: Props) {
  const [selectedMicrophoneIndex, setSelectedMicrophoneIndex] = React.useState(
    defaultValue.selectedMicrophoneIndex
  );
  const [muted, setMuted] = React.useState(defaultValue.muted);
  const webAudioMicAudioElRef = useRef<HTMLAudioElement>(null);
  const mediaDevices = useMediaDevices({ kind: "audioinput" });

  const microphones = useMemo(() => {
    const devices = mediaDevices.map((device) => ({
      name: device.label,
      id: device.deviceId,
      microphone: device,
    }));
    return [
      ...devices,
      {
        name: "Sine Wave",
        id: "sine-wave",
        microphone: { type: "sine" } as WebAudioMicSineWave,
      },
    ];
  }, [mediaDevices]);

  return (
    <MicrophoneContext.Provider
      value={{
        _provider: true,
        data: {
          microphones,
          selectedMicrophoneIndex,
          muted,

          selectMicrophone: setSelectedMicrophoneIndex,
          setMuted,
        },
      }}
    >
      <audio ref={webAudioMicAudioElRef} muted={muted} />
      <SineWaveMicrophone audioElRef={webAudioMicAudioElRef} />
      {children}
    </MicrophoneContext.Provider>
  );
}

export function useMicrophone() {
  const ctx = useContext(MicrophoneContext);
  if (!ctx._provider) {
    throw "useMicrophone must be used within a MicrophoneProvider";
  }

  return ctx.data;
}

type SineWaveMicrophoneProps = {
  audioElRef: React.RefObject<HTMLAudioElement>;
};

function SineWaveMicrophone({ audioElRef }: SineWaveMicrophoneProps) {
  const { selectedMicrophoneIndex, microphones, muted } = useMicrophone();

  const { audioContext } = useWebAudio();
  const oscillator = useRef<OscillatorNode | null>(null);
  const sink = useRef<MediaStreamAudioDestinationNode | null>(null);

  const isSineWaveSelected = useMemo(
    () => microphones[selectedMicrophoneIndex]?.id === "sine-wave",
    [microphones, selectedMicrophoneIndex]
  );

  useEffect(() => {
    const cleanup = () => {
      if (oscillator.current !== null) {
        oscillator.current.stop();
        oscillator.current.disconnect();
        oscillator.current = null;
      }
      if (sink.current !== null) {
        sink.current.disconnect();
        sink.current = null;
      }
    };

    if (
      !isSineWaveSelected ||
      audioContext === null ||
      audioElRef.current === null
    ) {
      cleanup();
      return;
    }

    oscillator.current = audioContext.createOscillator();
    sink.current = audioContext.createMediaStreamDestination();
    oscillator.current.connect(sink.current);

    audioElRef.current.srcObject = sink.current.stream;
    audioElRef.current.play();
  }, [audioContext, audioElRef, isSineWaveSelected]);

  return null;
}
