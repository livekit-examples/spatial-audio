import { Player } from "@/model/Player";
import { Dispatch, SetStateAction, useEffect } from "react";

const minXBoundary = -1000;
const maxXBoundary = 1000;
const minYBoundary = -1000;
const maxYBoundary = 1000;

type Props = {
  myPlayer: Player;
  setMyPlayer: Dispatch<SetStateAction<Player | null>>;
};

export const WorldBoundaryController = ({ myPlayer, setMyPlayer }: Props) => {
  useEffect(() => {
    if (myPlayer.position.x < minXBoundary) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: minXBoundary, y: prev.position.y },
          }
      );
      myPlayer.position.x = minXBoundary;
    }
    if (myPlayer.position.x > maxXBoundary) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: maxXBoundary, y: prev.position.y },
          }
      );
      myPlayer.position.x = maxXBoundary;
    }
    if (myPlayer.position.y < minYBoundary) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: prev.position.x, y: minYBoundary },
          }
      );
      myPlayer.position.y = minYBoundary;
    }
    if (myPlayer.position.y > maxYBoundary) {
      setMyPlayer(
        (prev) =>
          prev && {
            ...prev,
            position: { x: prev.position.x, y: maxYBoundary },
          }
      );
      myPlayer.position.y = maxYBoundary;
    }
  }, [myPlayer, setMyPlayer]);

  return null;
};
