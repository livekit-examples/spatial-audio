import { useState } from "react";
import { AnimationState } from "./AnimationState";
import { Inputs } from "./Inputs";
import { Player } from "./Player";
import { Vector2 } from "./Vector2";

export type GameState = {
  inputs: Inputs;
  myPlayer: Player;
  remotePlayers: Player[];
  networkPositions: Map<string, Vector2>;
};

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

  return {
    inputs,
    myPlayer,
    remotePlayers,
    networkPositions,
    networkAnimations,

    setMyPlayer,
    setInputs,
    setRemotePlayers,
    setNetworkPositions,
    setNetworkAnimations,
  };
};
