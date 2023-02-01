"use-client";

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
} from "react";
import { useInterval, useRaf } from "react-use";

export type PositionData = {
  setMyPosition: (position: { x: number; y: number }) => void;
};

const defaultValue: PositionData = {
  setMyPosition: () => null,
};

const PositionContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type Props = {
  children: React.ReactNode;
};

export function PositionProvider({ children }: Props) {
  const { message, send } = useDataChannelMessages({ channelId: "position" });
  const myPosition = useRef<{ x: number; y: number } | null>(null);
  const remoteParticipants = useRemoteParticipants({});
  const playerPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );

  useInterval(async () => {
    if (!myPosition.current) return;
    await send(
      { channelId: "position", payload: myPosition.current },
      DataPacket_Kind.LOSSY
    );
  }, 500);

  const setMyPosition = useCallback(async (pos: { x: number; y: number }) => {
    myPosition.current = pos;
  }, []);

  const remoteParticipantLookup = useMemo(() => {
    return new Set(remoteParticipants.map((p) => p.identity));
  }, [remoteParticipants]);

  // Cleanup positions for participants that have left
  useEffect(() => {
    const newPlayerPositions = new Map();
    const positionIdentities = Array.from(playerPositions.current.keys());
    for (const identity of positionIdentities) {
      if (!remoteParticipantLookup.has(identity)) {
        playerPositions.current.delete(identity);
      }
    }
  }, [remoteParticipantLookup]);

  useEffect(() => {
    console.log("NEIL got message", message);
  }, [message]);

  return (
    <PositionContext.Provider
      value={{ _provider: true, data: { setMyPosition } }}
    >
      {children}
    </PositionContext.Provider>
  );
}

export function usePosition() {
  const ctx = useContext(PositionContext);
  if (!ctx._provider) {
    throw "usePosition must be used within a PositionProvider";
  }

  return ctx.data;
}
