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
  useState,
} from "react";
import { useInterval, useRaf } from "react-use";

export type PositionData = {
  setMyPosition: (position: { x: number; y: number }) => void;
  playerPositions: Map<string, { x: number; y: number }>;
};

const defaultValue: PositionData = {
  setMyPosition: () => null,
  playerPositions: new Map(),
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
  const [playerPositions, setPlayerPositions] = useState<
    Map<string, { x: number; y: number }>
  >(new Map());

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
    setPlayerPositions((prev) => {
      const positionIdentities = Array.from(prev.keys());
      for (const identity of positionIdentities) {
        if (!remoteParticipantLookup.has(identity)) {
          prev.delete(identity);
        }
      }

      return new Map(prev);
    });
  }, [remoteParticipantLookup]);

  useEffect(() => {
    setPlayerPositions((prev) => {
      if (!message?.from?.identity || !message.payload) return prev;
      prev.set(
        message.from.identity,
        message.payload as { x: number; y: number }
      );
      return new Map(prev);
    });
  }, [message]);

  return (
    <PositionContext.Provider
      value={{ _provider: true, data: { setMyPosition, playerPositions } }}
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
