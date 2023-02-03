"use-client";

import { AnimationState } from "@/components/Character";
import {
  useDataChannelMessages,
  useRemoteParticipants,
} from "@livekit/components-react";
import { DataPacket_Kind } from "livekit-client";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useInterval, useRaf } from "react-use";

const TICK_FPS = 30;

type RemotePlayer = {
  identity: string;
  position: { x: number; y: number };
  animation: AnimationState;
};

export type NetcodeData = {
  myPosition: { x: number; y: number } | null;
  setMyPosition: (position: { x: number; y: number }) => void;
  remotePlayers: RemotePlayer[];
};

const defaultValue: NetcodeData = {
  myPosition: null,
  setMyPosition: () => null,
  remotePlayers: [],
};

const PositionContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type Props = {
  children: React.ReactNode;
};

export function NetcodeProvider({ children }: Props) {
  const { message, send } = useDataChannelMessages({ channelId: "position" });
  const [myPosition, setMyPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const remoteParticipants = useRemoteParticipants({});
  const _playerPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const _interpolatedPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const [remotePlayers, setRemotePlayers] = useState<RemotePlayer[]>([]);
  const lastTime = useRef<number>(0);

  const sendMyPosition = useCallback(async () => {
    if (!myPosition) return;
    await send(
      { channelId: "position", payload: myPosition },
      DataPacket_Kind.LOSSY
    );
  }, [myPosition, send]);

  const remoteParticipantLookup = useMemo(() => {
    return new Set(remoteParticipants.map((p) => p.identity));
  }, [remoteParticipants]);

  // Cleanup positions for participants that have left
  useEffect(() => {
    const positionIdentities = Array.from(_playerPositions.current.keys());
    for (const identity of positionIdentities) {
      if (!remoteParticipantLookup.has(identity)) {
        _playerPositions.current.delete(identity);
      }
    }
  }, [remoteParticipantLookup]);

  // Update positions from messages
  useEffect(() => {
    if (!message?.from?.identity || !message.payload) return;
    _playerPositions.current.set(
      message.from.identity,
      message.payload as { x: number; y: number }
    );
  }, [message]);

  const interpolatePositions = useCallback(() => {
    const targetKeys = Array.from(_playerPositions.current.keys());
    const interpolatedKeys = Array.from(_interpolatedPositions.current.keys());

    // cleanup positions that don't have a target position
    for (const identity of interpolatedKeys) {
      if (!_playerPositions.current.has(identity)) {
        _interpolatedPositions.current.delete(identity);
      }
    }

    // Crude interpolation that tries to match the 0.5 second send interval
    for (const identity of targetKeys) {
      const currentPosition =
        _interpolatedPositions.current.get(identity) ||
        _playerPositions.current.get(identity);
      const targetPosition = _playerPositions.current.get(identity);
      const newPosition = {
        x:
          currentPosition!.x +
          (targetPosition!.x - currentPosition!.x) * (2 / TICK_FPS),
        y:
          currentPosition!.y +
          (targetPosition!.y - currentPosition!.y) * (2 / TICK_FPS),
      };
      _interpolatedPositions.current.set(identity, newPosition);
    }
  }, []);

  const updateRemotePlayers = useCallback(() => {
    const res: RemotePlayer[] = [];
    const interpolatedKeys = Array.from(_interpolatedPositions.current.keys());
    for (const identity of interpolatedKeys) {
      res.push({
        identity,
        position: _interpolatedPositions.current.get(identity)!,
        animation: "idle_down",
      });
    }
    setRemotePlayers(res);
  }, []);

  const update = useCallback(() => {
    interpolatePositions();
    updateRemotePlayers();
  }, [interpolatePositions, updateRemotePlayers]);

  useInterval(sendMyPosition, 500);
  useInterval(update, 1000 / 30);

  return (
    <PositionContext.Provider
      value={{
        _provider: true,
        data: { setMyPosition, remotePlayers, myPosition },
      }}
    >
      {children}
    </PositionContext.Provider>
  );
}

export function useNetcode() {
  const ctx = useContext(PositionContext);
  if (!ctx._provider) {
    throw "useNetcode must be used within a PositionProvider";
  }

  return ctx.data;
}
