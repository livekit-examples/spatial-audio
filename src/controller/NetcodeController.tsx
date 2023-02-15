"use-client";

import { AnimationState } from "@/model/AnimationState";
import { Player } from "@/model/Player";
import { Vector2 } from "@/model/Vector2";
import {
  useConnectionState,
  useDataChannelMessages,
  useRemoteParticipants,
} from "@livekit/components-react";
import type { BaseDataMessage } from "@livekit/components-core";
import { ConnectionState, DataPacket_Kind } from "livekit-client";
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

interface PositionMessage extends BaseDataMessage {
  channelId: "position";
  payload: { x: number; y: number };
}

interface AnimationMessage extends BaseDataMessage {
  channelId: "animation";
  payload: AnimationState;
}

export function NetcodeController({
  myPlayer,
  setNetworkAnimations,
  setNetworkPositions,
}: Props) {
  const { message: positionMessage, send: positionSend } =
    useDataChannelMessages<PositionMessage>("position");
  const { message: animationMessage, send: animationSend } =
    useDataChannelMessages<AnimationMessage>("animation");

  const connectionState = useConnectionState();
  const remoteParticipants = useRemoteParticipants({});

  const _playerPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );
  const _animations = useRef<Map<string, AnimationState>>(new Map());

  const _myPosition = useRef<Vector2>(myPlayer.position);
  const _myAnimation = useRef<AnimationState>(myPlayer.animation);
  const positionSendLock = useRef(false);
  const animationSendLock = useRef(false);

  // Take myPosition and myAnimation out of react-land so we can send them reliable on a fixed interval
  useEffect(() => {
    _myPosition.current = myPlayer.position;
    _myAnimation.current = myPlayer.animation;
  }, [myPlayer]);

  const sendMyPosition = useCallback(async () => {
    if (positionSendLock.current) return;
    positionSendLock.current = true;
    try {
      await positionSend(_myPosition.current, DataPacket_Kind.LOSSY);
    } finally {
      positionSendLock.current = false;
    }
  }, [positionSend]);

  const sendMyAnimation = useCallback(async () => {
    if (animationSendLock.current) return;
    animationSendLock.current = true;
    try {
      await animationSend(_myAnimation.current, DataPacket_Kind.LOSSY);
    } finally {
      animationSendLock.current = false;
    }
  }, [animationSend]);

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

  // Update positions from messages
  useEffect(() => {
    if (!positionMessage?.from?.identity || !positionMessage.payload) return;
    _playerPositions.current.set(
      positionMessage.from.identity,
      positionMessage.payload
    );
  }, [positionMessage]);

  // Update animations from messages
  useEffect(() => {
    if (!animationMessage?.from?.identity || !animationMessage.payload) return;
    _animations.current.set(
      animationMessage.from.identity,
      animationMessage.payload
    );
  }, [animationMessage]);

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
