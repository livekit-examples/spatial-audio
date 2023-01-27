import {
  useMediaDevices,
  useMediaDeviceSelect,
} from "@livekit/components-react";
import React, { useContext, useMemo } from "react";

type SelectMicrophoneFn = (index: number) => void;

type Data = {
  microphones: MicrophoneSelection[];
  selectedMicrophoneIndex: number;

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
          selectMicrophone: setSelectedMicrophoneIndex,
        },
      }}
    >
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