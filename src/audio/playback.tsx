"use-client";

import { ParticipantList } from "@/components/ParticipantList";
import {
  useLiveKitRoom,
  useLocalParticipant,
  useMediaDevices,
  useMediaTrack,
  useParticipantContext,
  useRemoteParticipants,
  useRoomContext,
  useTrack,
  useTracks,
} from "@livekit/components-react";
import {
  Participant,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  RoomEvent,
} from "livekit-client";
import { requestToBodyStream } from "next/dist/server/body-streams";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWebAudio } from "./webAudio";

type Data = {
  setMyPosition: (position: { x: number; y: number }) => void;
  setPosition: (
    participant: Participant,
    position: { x: number; y: number }
  ) => void;
};

const defaultValue: Data = {
  setPosition: () => null,
  setMyPosition: () => null,
};

const PlaybackContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type Props = {
  children: React.ReactNode;
};

type RemoteParticipantPlaybackProps = {
  participant: RemoteParticipant;
  myPosition: { x: number; y: number };
  position: { x: number; y: number };
};

function RemoteParticipantPlayback({
  participant,
  myPosition,
  position,
}: RemoteParticipantPlaybackProps) {
  useEffect(() => {
    console.log("NEIL remote participant playback", participant.identity);
  }, [participant.identity]);

  return (
    <div>
      <audio />
    </div>
  );
}

export function PlaybackProvider({ children }: Props) {
  const room = useRoomContext();
  const remoteParticipants = useRemoteParticipants({});
  const [myPosition, setMyPosition] = useState<{ x: number; y: number }>({
    x: Infinity,
    y: Infinity,
  });

  // identity -> position map
  const [positions, setPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());

  // initialize or cleanup positions when participants change
  useEffect(() => {
    setPositions((prev) => {
      const existing = new Set(prev);
      const connected = new Set(remoteParticipants.map((p) => p.identity));
      const newPositions = new Map(prev);
      const existingArray = Array.from(existing);
      for (const e in existingArray) {
        if (!connected.has(e)) {
          newPositions.delete(e);
        }
      }

      remoteParticipants.forEach((participant) => {
        newPositions.set(participant.identity, { x: Infinity, y: Infinity });
      });

      return newPositions;
    });
  }, [remoteParticipants, room.participants]);

  const setPosition = useCallback(
    (participant: Participant, position: { x: number; y: number }) => {
      setPositions((prev) => {
        if (!prev.has(participant.identity)) {
          return prev;
        }
        prev.set(participant.identity, position);
        return new Map(prev);
      });
    },
    []
  );

  return (
    <PlaybackContext.Provider
      value={{
        _provider: true,
        data: { setPosition, setMyPosition },
      }}
    >
      {remoteParticipants.map((rp) => {
        const position = positions.get(rp.identity) || {
          x: Infinity,
          y: Infinity,
        };
        return (
          <RemoteParticipantPlayback
            key={rp.identity}
            participant={rp as RemoteParticipant}
            position={position}
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
