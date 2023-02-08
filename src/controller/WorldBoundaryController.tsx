import { Player } from "@/model/Player";
import { Dispatch, SetStateAction, useEffect } from "react";

type Props = {
  worldBoundaries: { minX: number; maxX: number; minY: number; maxY: number };
  myPlayer: Player;
  setMyPlayer: Dispatch<SetStateAction<Player | null>>;
};

export const WorldBoundaryController = ({
  worldBoundaries: { minX, maxX, minY, maxY },
  myPlayer,
  setMyPlayer,
}: Props) => {
  useEffect(() => {
    if (myPlayer.position.x < minX) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: minX, y: prev.position.y },
          }
      );
      myPlayer.position.x = minX;
    }
    if (myPlayer.position.x > maxX) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: maxX, y: prev.position.y },
          }
      );
      myPlayer.position.x = maxX;
    }
    if (myPlayer.position.y < minY) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: prev.position.x, y: minY },
          }
      );
      myPlayer.position.y = minY;
    }
    if (myPlayer.position.y > maxY) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: prev.position.x, y: maxY },
          }
      );
      myPlayer.position.y = maxY;
    }
  }, [maxX, maxY, minX, minY, myPlayer, setMyPlayer]);

  return null;
};
