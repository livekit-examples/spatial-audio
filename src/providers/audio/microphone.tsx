"use-client";

import {
  useLocalParticipant,
  useMediaDevices,
} from "@livekit/components-react";
import { LocalAudioTrack, Track } from "livekit-client";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useUnmount } from "react-use";
import { useWebAudio } from "./webAudio";

type SelectMicrophoneFn = (index: number) => void;

type Data = {
  microphones: MicrophoneSelection[];
  selectedMicrophoneIndex: number;
  muted: boolean;

  setMuted: (muted: boolean) => void;
  selectMicrophone: SelectMicrophoneFn;
};

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
  const [publishing, setPublishing] = React.useState(false);
  const webAudioMediaStream = useRef<MediaStream | null>(null);
  const mediaDevices = useMediaDevices({ kind: "audioinput" });
  const { localParticipant } = useLocalParticipant();
  const publishingStream = useRef<MediaStreamTrack | null>(null);

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
      },
      {
        type: "web_audio",
        name: "Disco Mode",
        id: "audio-file",
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

  const getTrack = useCallback(async () => {
    if (selectedMicrophone?.type === "device") {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: {
            exact: mediaDevices[selectedMicrophoneIndex].deviceId,
          },
        },
      });
      return mediaStream.getAudioTracks()[0];
    } else if (selectedMicrophone?.type === "web_audio") {
      return webAudioMediaStream.current?.getAudioTracks()[0];
    }
    return null;
  }, [
    mediaDevices,
    selectedMicrophone?.type,
    selectedMicrophoneIndex,
    webAudioMediaStream,
  ]);

  const isSineWaveSelected = useMemo(
    () => selectedMicrophone?.id === "sine-wave",
    [selectedMicrophone?.id]
  );

  const isFileSelected = useMemo(
    () => selectedMicrophone?.id === "audio-file",
    [selectedMicrophone?.id]
  );

  const publishTrack = useCallback(
    async (mediaStreamTrack: MediaStreamTrack) => {
      if (publishingStream.current === mediaStreamTrack) return;
      publishingStream.current = mediaStreamTrack;
      try {
        const track = new LocalAudioTrack(mediaStreamTrack);
        track.source = Track.Source.Microphone;
        await localParticipant?.publishTrack(track);
      } catch (e) {
        console.error("Error publishing", e);
        publishingStream.current = null;
        setPublishing(false);
      } finally {
        setPublishing(true);
      }
    },
    [localParticipant]
  );

  const unpublishTrack = useCallback(async () => {
    if (publishingStream.current) {
      await localParticipant?.unpublishTrack(publishingStream.current);
      publishingStream.current = null;
      setPublishing(false);
    }
  }, [localParticipant]);

  const setMuted = useCallback(
    async (muted: boolean) => {
      _setMuted(muted);
      await unpublishTrack();
      if (!muted) {
        const track = await getTrack();
        if (track) await publishTrack(track);
      }
    },
    [getTrack, publishTrack, unpublishTrack]
  );

  // if the user has not selected a microphone, select the default one
  useEffect(() => {
    setSelectedMicrophoneIndex((prev) => {
      if (prev === -1) {
        return microphones.findIndex((m) => m.id === "default");
      }
      return prev;
    });
  }, [microphones]);

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
      {isSineWaveSelected && !_muted && (
        <SineWaveMicrophone
          onStream={(ms) => {
            if (webAudioMediaStream.current === ms) return;
            webAudioMediaStream.current = ms;
            setMuted(_muted);
          }}
        />
      )}
      {isFileSelected && !_muted && (
        <AudioFileMicrophone
          onStream={(ms) => {
            if (webAudioMediaStream.current === ms) return;
            webAudioMediaStream.current = ms;
            setMuted(_muted);
          }}
        />
      )}
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
  onStream: (stream: MediaStream | null) => void;
};

const SineWaveMicrophone = ({ onStream }: SineWaveMicrophoneProps) => {
  const { audioContext } = useWebAudio();
  const oscillator = useRef<OscillatorNode | null>(null);
  const sink = useRef<MediaStreamAudioDestinationNode | null>(null);

  const cleanupWebAudio = useRef(() => {
    if (oscillator.current !== null) {
      oscillator.current.stop();
      oscillator.current.disconnect();
      oscillator.current = null;
    }
    if (sink.current !== null) {
      sink.current.disconnect();
      sink.current = null;
    }
  });

  const createWebAudio = useRef(() => {
    if (audioContext === null) return;
    oscillator.current = audioContext.createOscillator();
    sink.current = audioContext.createMediaStreamDestination();
    oscillator.current.connect(sink.current);
    oscillator.current.start();
    onStream(sink.current.stream);
  });

  // cleanup on unmount
  useEffect(() => {
    createWebAudio.current();
    // apease the linter by storing cleanup in a variable that won't change before cleanup (even though we know it won't)
    const cu = cleanupWebAudio.current;
    return () => {
      cu();
    };
  }, [cleanupWebAudio, createWebAudio]);

  return null;
};

type AudioFileMicrophoneProps = {
  onStream: (stream: MediaStream | null) => void;
};

const AudioFileMicrophone = ({ onStream }: AudioFileMicrophoneProps) => {
  const { audioContext } = useWebAudio();
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const source = useRef<MediaElementAudioSourceNode | null>(null);
  const sink = useRef<MediaStreamAudioDestinationNode | null>(null);

  const cleanupWebAudio = useCallback(() => {
    if (source.current !== null) {
      source.current.disconnect();
      source.current = null;
    }
    if (sink.current !== null) {
      sink.current.disconnect();
      sink.current = null;
    }
  }, []);

  const createWebAudio = useCallback(() => {
    if (
      audioContext === null ||
      audioEl.current === null ||
      source.current !== null
    )
      return;
    source.current = audioContext.createMediaElementSource(audioEl.current);
    sink.current = audioContext.createMediaStreamDestination();
    source.current.connect(sink.current);
    onStream(sink.current.stream);
  }, [audioContext, onStream]);

  useEffect(() => {
    createWebAudio();
  }, [createWebAudio]);

  useUnmount(cleanupWebAudio);

  return (
    <audio
      muted={false}
      autoPlay={true}
      ref={audioEl}
      src="/disco.mp3"
      loop={true}
    />
  );
};
