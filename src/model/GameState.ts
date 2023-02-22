import { useState } from "react";
import { AnimationState } from "./AnimationState";
import { Inputs } from "./Inputs";
import { JukeBoxState } from "./JukeBoxState";
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
  const [jukeBoxPosition, setJukeBoxPosition] = useState<Vector2>({
    x: 0,
    y: -200,
  });
  const [jukeBoxState, setJukeBoxState] = useState<JukeBoxState>({
    type: "off",
  });

  return {
    inputs,
    myPlayer,
    remotePlayers,
    networkPositions,
    networkAnimations,
    worldBoundaries: { minX: -775, maxX: 780, minY: -790, maxY: 770 },
    cameraOffset,
    backgroundZIndex: -100000,
    earshotRadius: 300,
    playerSpeed: 6,
    jukeBoxPosition,
    jukeBoxState,

    setMyPlayer,
    setInputs,
    setRemotePlayers,
    setNetworkPositions,
    setNetworkAnimations,
    setCameraOffset,
    setJukeBoxPosition,
    setJukeBoxState,
  };
};
