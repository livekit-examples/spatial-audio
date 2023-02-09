import { Player } from "@/model/Player";
import { Participant } from "livekit-client";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type Props = {
  localParticipant: Participant | null;
  myPlayer: Player | null;
  setMyPlayer: Dispatch<SetStateAction<Player | null>>;
};

export function MyPlayerSpawnController({
  setMyPlayer,
  myPlayer,
  localParticipant,
}: Props) {
  useEffect(() => {
    if (myPlayer === null && localParticipant?.identity) {
      setMyPlayer({
        username: localParticipant.identity,
        position: { x: 0, y: 0 },
        animation: "idle_down",
      });
    }
  }, [localParticipant, myPlayer, setMyPlayer]);
  return null;
}