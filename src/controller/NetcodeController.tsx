"use-client";

import { AnimationState } from "@/model/AnimationState";
import { Player } from "@/model/Player";
import { Vector2 } from "@/model/Vector2";
import {
  useConnectionState,
  useLocalParticipant,
  useRemoteParticipants,
  useRoomContext,
} from "@livekit/components-react";
import {
  ConnectionState,
  DataPacket_Kind,
  RemoteParticipant,
  RoomEvent,
} from "livekit-client";
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useInterval } from "react-use";

type Props = {
  myPlayer: Player;
  setNetworkPositions: Dispatch<SetStateAction<Map<string, Vector2>>>;
  setNetworkAnimations: Dispatch<SetStateAction<Map<string, AnimationState>>>;
};

export function NetcodeController({
  myPlayer,
  setNetworkAnimations,
  setNetworkPositions,
}: Props) {
  // LiveKit state
  const roomCtx = useRoomContext();
  const connectionState = useConnectionState();
  const remoteParticipants = useRemoteParticipants({});
  const { localParticipant } = useLocalParticipant();

  // Position and animation state
  const _playerPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const _animations = useRef<Map<string, AnimationState>>(new Map());
  const _myPosition = useRef<Vector2>(myPlayer.position);
  const _myAnimation = useRef<AnimationState>(myPlayer.animation);

  const positionSendLock = useRef(false);
  const animationSendLock = useRef(false);
  const textEncoder = useRef(new TextEncoder());
  const textDecoder = useRef(new TextDecoder());

  const onDataChannel = useCallback(
    (payload: Uint8Array, participant: RemoteParticipant | undefined) => {
      if (!participant) return;
      const data = JSON.parse(textDecoder.current.decode(payload));
      if (data.channelId === "position") {
        const { x, y } = data.payload;
        _playerPositions.current.set(participant.identity, { x, y });
      } else if (data.channelId === "animation") {
        _animations.current.set(participant.identity, data.payload);
      }
    },
    []
  );

  // Setup datachannel listener
  useEffect(() => {
    roomCtx.on(RoomEvent.DataReceived, onDataChannel);

    return () => {
      roomCtx.off(RoomEvent.DataReceived, onDataChannel);
    };
  }, [onDataChannel, roomCtx]);

  // Take myPosition and myAnimation out of react-land so we can send them reliable on a fixed interval
  useEffect(() => {
    _myPosition.current = myPlayer.position;
    _myAnimation.current = myPlayer.animation;
  }, [myPlayer]);

  const sendMyPosition = useCallback(async () => {
    if (positionSendLock.current) return;
    positionSendLock.current = true;
    try {
      const payload: Uint8Array = textEncoder.current.encode(
        JSON.stringify({ payload: _myPosition.current, channelId: "position" })
      );
      await localParticipant.publishData(payload, DataPacket_Kind.LOSSY);
    } finally {
      positionSendLock.current = false;
    }
  }, [localParticipant]);

  const sendMyAnimation = useCallback(async () => {
    if (animationSendLock.current) return;
    animationSendLock.current = true;
    try {
      const payload: Uint8Array = textEncoder.current.encode(
        JSON.stringify({
          payload: _myAnimation.current,
          channelId: "animation",
        })
      );
      await localParticipant.publishData(payload, DataPacket_Kind.LOSSY);
    } finally {
      animationSendLock.current = false;
    }
  }, [localParticipant]);

  const remoteParticipantLookup = useMemo(() => {
    return new Set(remoteParticipants.map((p) => p.identity));
  }, [remoteParticipants]);

  // Cleanup positions and animations for participants that have left
  useEffect(() => {
    const positionIdentities = Array.from(_playerPositions.current.keys());
    const animationIdentities = Array.from(_animations.current.keys());
    for (const identity of positionIdentities) {
      if (!remoteParticipantLookup.has(identity)) {
        _playerPositions.current.delete(identity);
      }
    }
    for (const identity of animationIdentities) {
      if (!remoteParticipantLookup.has(identity)) {
        _animations.current.delete(identity);
      }
    }
  }, [remoteParticipantLookup]);

  const setNetworkValues = useCallback(() => {
    setNetworkAnimations(new Map(_animations.current));
    setNetworkPositions(new Map(_playerPositions.current));
  }, [setNetworkAnimations, setNetworkPositions]);

  const sendUpdate = useCallback(() => {
    if (connectionState !== ConnectionState.Connected) return;
    sendMyPosition();
    sendMyAnimation();
  }, [connectionState, sendMyAnimation, sendMyPosition]);

  useInterval(setNetworkValues, 100);
  useInterval(sendUpdate, 100);

  return null;
}
