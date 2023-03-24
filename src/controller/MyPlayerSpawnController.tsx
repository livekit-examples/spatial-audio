import { CharacterName } from "@/components/CharacterSelector";
import { Player } from "@/model/Player";
import { Participant } from "livekit-client";
import { Dispatch, SetStateAction, useEffect } from "react";

type Props = {
  localParticipant: Participant | null;
  localCharacter: CharacterName | null;
  myPlayer: Player | null;
  setMyPlayer: Dispatch<SetStateAction<Player | null>>;
};

export function MyPlayerSpawnController({
  setMyPlayer,
  myPlayer,
  localParticipant,
  localCharacter,
}: Props) {
  useEffect(() => {
    if (myPlayer === null && localParticipant?.identity && localCharacter) {
      setMyPlayer({
        username: localParticipant.identity,
        position: { x: 10, y: 0 },
        animation: "idle_left",
        character: localCharacter,
      });
    }
  }, [localCharacter, localParticipant, myPlayer, setMyPlayer]);
  return null;
}
