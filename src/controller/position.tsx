"use-client";

import { MyCharacter } from "@/components/MyCharacter";
import { useDataChannelMessages } from "@livekit/components-react";
import { DataPacket_Kind } from "livekit-client";
import React, { useCallback, useContext, useEffect } from "react";

type Data = {
  setMyPosition: (position: { x: number; y: number }) => void;
};

const defaultValue: Data = {
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

  const setMyPosition = useCallback(
    (pos: { x: number; y: number }) => {
      send({ channelId: "position", payload: pos }, DataPacket_Kind.LOSSY);
    },
    [send]
  );

  useEffect(() => {}, [message]);

  useEffect(() => {
    console.log("NEIL childredn", children);
  }, [children]);

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
