"use-client";

import {
  useLiveKitRoom,
  useLocalParticipant,
  useMediaDevices,
  useMediaTrack,
  useRoomContext,
} from "@livekit/components-react";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

interface MicrophoneSelectionDevice {
  type: "device";
  name: string;
  id: string;
  microphone: MediaDeviceInfo;
}

interface MicrophoneSelectionWebAudio {
  type: "web_audio";
  name: string;
  id: string;
  microphone: WebAudioMic;
}

type MicrophoneSelection =
  | MicrophoneSelectionDevice
  | MicrophoneSelectionWebAudio;

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
  const [_muted, _setMuted] = React.useState(defaultValue.muted);
  const [webAudioMediaStream, setWebAudioMediaStream] =
    useState<MediaStream | null>(null);
  const webAudioMicAudioElRef = useRef<HTMLAudioElement>(null);
  const mediaDevices = useMediaDevices({ kind: "audioinput" });
  const { localParticipant } = useLocalParticipant();

  const microphones: MicrophoneSelection[] = useMemo(() => {
    const devices: MicrophoneSelectionDevice[] = mediaDevices.map((device) => ({
      type: "device",
      name: device.label,
      id: device.deviceId,
      microphone: device,
    }));
    return [
      ...devices,
      {
        type: "web_audio",
        name: "Sine Wave",
        id: "sine-wave",
        microphone: { type: "sine" } as WebAudioMicSineWave,
      },
    ];
  }, [mediaDevices]);

  const selectedMicrophone = useMemo(() => {
    if (
      selectedMicrophoneIndex === -1 ||
      selectedMicrophoneIndex >= microphones.length
    ) {
      return null;
    }

    return microphones[selectedMicrophoneIndex];
  }, [microphones, selectedMicrophoneIndex]);

  const setMuted = useCallback(
    async (muted: boolean) => {
      if (selectedMicrophone === null) {
        _setMuted(true);
        return;
      }
      if (!muted) {
        if (selectedMicrophone.type === "device") {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: {
                exact: mediaDevices[selectedMicrophoneIndex].deviceId,
              },
            },
          });
          await localParticipant?.publishTrack(mediaStream.getAudioTracks()[0]);
        } else if (selectedMicrophone.type === "web_audio") {
          if (webAudioMediaStream === null) {
            _setMuted(true);
            return;
          }
          await localParticipant?.publishTrack(
            webAudioMediaStream.getAudioTracks()[0]
          );
        }
      } else {
        //TODO
        //await localParticipant?.unpublishTrack();
      }

      _setMuted(muted);
    },
    [
      localParticipant,
      mediaDevices,
      selectedMicrophone,
      selectedMicrophoneIndex,
      webAudioMediaStream,
    ]
  );

  useEffect(() => {
    if (
      webAudioMediaStream !== null &&
      webAudioMicAudioElRef.current !== null
    ) {
      const audioEl = webAudioMicAudioElRef.current;
      audioEl.srcObject = webAudioMediaStream;
      audioEl.play();
    }
  }, [webAudioMediaStream]);

  return (
    <MicrophoneContext.Provider
      value={{
        _provider: true,
        data: {
          microphones,
          selectedMicrophoneIndex,
          muted: _muted,

          selectMicrophone: setSelectedMicrophoneIndex,
          setMuted,
        },
      }}
    >
      <audio ref={webAudioMicAudioElRef} muted={true} />
      <SineWaveMicrophone setStream={setWebAudioMediaStream} />
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
  setStream: (stream: MediaStream) => void;
};

function SineWaveMicrophone({ setStream }: SineWaveMicrophoneProps) {
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

    if (!isSineWaveSelected || audioContext === null) {
      cleanup();
      return;
    }

    oscillator.current = audioContext.createOscillator();
    sink.current = audioContext.createMediaStreamDestination();
    oscillator.current.connect(sink.current);
    oscillator.current.start();
    setStream(sink.current.stream);
  }, [audioContext, isSineWaveSelected, setStream]);

  return null;
}
