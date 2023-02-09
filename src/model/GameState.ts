import { useState } from "react";
import { AnimationState } from "./AnimationState";
import { Inputs } from "./Inputs";
import { Player } from "./Player";
import { Vector2 } from "./Vector2";

export const useGameState = () => {
  const [inputs, setInputs] = useState<Inputs>({ direction: { x: 0, y: 0 } });
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [remotePlayers, setRemotePlayers] = useState<Player[]>([]);
  const [networkPositions, setNetworkPositions] = useState<
    Map<string, Vector2>
  >(new Map());
  const [networkAnimations, setNetworkAnimations] = useState<
    Map<string, AnimationState>
  >(new Map());
  const [cameraOffset, setCameraOffset] = useState<Vector2>({ x: 0, y: 0 });

  return {
    inputs,
    myPlayer,
    remotePlayers,
    networkPositions,
    networkAnimations,
    worldBoundaries: { minX: -500, maxX: 500, minY: -500, maxY: 500 },
    cameraOffset,
    backgroundZIndex: -100000,
    earshotRadius: 300,

    setMyPlayer,
    setInputs,
    setRemotePlayers,
    setNetworkPositions,
    setNetworkAnimations,
    setCameraOffset,
  };
};