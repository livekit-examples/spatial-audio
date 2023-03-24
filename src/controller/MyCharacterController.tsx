import { Inputs } from "@/model/Inputs";
import { Player } from "@/model/Player";
import { useTick } from "@pixi/react";
import { Dispatch, SetStateAction } from "react";

type Props = {
  playerSpeed: number;
  inputs: Inputs;
  setMyPlayer: Dispatch<SetStateAction<Player | null>>;
};

export function MyCharacterController({
  playerSpeed,
  inputs,
  setMyPlayer,
}: Props) {
  useTick((delta) => {
    setMyPlayer((prev) => {
      if (!prev) {
        return prev;
      }

      const magnitude = Math.sqrt(
        inputs.direction.x ** 2 + inputs.direction.y ** 2
      );
      let newAnimation = prev.animation;
      let newPosition = { ...prev.position };
      let walking = magnitude > 0.01;

      const velocity = {
        x: magnitude > 0 ? (inputs.direction.x * playerSpeed) / magnitude : 0,
        y: magnitude > 0 ? (inputs.direction.y * playerSpeed) / magnitude : 0,
      };

      if (velocity.x > 0 && walking) {
        newAnimation = "walk_right";
      } else if (velocity.x < 0 && walking) {
        newAnimation = "walk_left";
      } else {
        if (walking) {
          if (prev.animation.endsWith("_right")) {
            newAnimation = "walk_right";
          } else {
            newAnimation = "walk_left";
          }
        } else {
          if (prev.animation.endsWith("_right")) {
            newAnimation = "idle_right";
          } else {
            newAnimation = "idle_left";
          }
        }
      }

      newPosition = {
        x: prev.position.x + velocity.x * delta,
        y: prev.position.y + velocity.y * delta,
      };

      return { ...prev, position: newPosition, animation: newAnimation };
    });
  });
  return null;
}
