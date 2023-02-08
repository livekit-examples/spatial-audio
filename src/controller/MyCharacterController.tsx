import { Inputs } from "@/model/Inputs";
import { Player } from "@/model/Player";
import { useTick } from "@pixi/react";
import { Dispatch, SetStateAction } from "react";

const MAX_SPEED = 1;

type Props = {
  inputs: Inputs;
  setMyPlayer: Dispatch<SetStateAction<Player | null>>;
};

export function MyCharacterController({ inputs, setMyPlayer }: Props) {
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
      if (magnitude === 0) {
        if (prev.animation === "walk_up") {
          newAnimation = "idle_up";
        } else if (prev.animation === "walk_down") {
          newAnimation = "idle_down";
        } else if (prev.animation === "walk_left") {
          newAnimation = "idle_left";
        } else if (prev.animation === "walk_right") {
          newAnimation = "idle_right";
        }
      }

      const velocity = {
        x: magnitude > 0 ? (inputs.direction.x * MAX_SPEED) / magnitude : 0,
        y: magnitude > 0 ? (inputs.direction.y * MAX_SPEED) / magnitude : 0,
      };

      newPosition = {
        x: prev.position.x + velocity.x * delta,
        y: prev.position.y + velocity.y * delta,
      };

      if (velocity.x > 0 && Math.abs(velocity.x) > Math.abs(velocity.y)) {
        newAnimation = "walk_right";
      } else if (
        velocity.x < 0 &&
        Math.abs(velocity.x) > Math.abs(velocity.y)
      ) {
        newAnimation = "walk_left";
      } else if (
        velocity.y > 0 &&
        Math.abs(velocity.y) > Math.abs(velocity.x)
      ) {
        newAnimation = "walk_down";
      } else if (
        velocity.y < 0 &&
        Math.abs(velocity.y) > Math.abs(velocity.x)
      ) {
        newAnimation = "walk_up";
      }

      return { ...prev, position: newPosition, animation: newAnimation };
    });
  });
  return null;
}
