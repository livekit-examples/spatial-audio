import { NetcodeData } from "@/controller/netcode";
import { useTick } from "@pixi/react";
import { useEffect, useRef, useState } from "react";
import { AnimationState, Character } from "./Character";

const MAX_SPEED = 1;

type Props = {
  username: string;
  netcode: NetcodeData;
};

export function MyCharacter({ netcode, username }: Props) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const inputs = useRef({ x: 0, y: 0 });
  const [animation, setAnimation] = useState<AnimationState>("idle_down");

  const keyDownListener = useRef((e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "w") {
      inputs.current.y = -1;
    } else if (e.key === "ArrowDown" || e.key === "s") {
      inputs.current.y = 1;
    }

    if (e.key === "ArrowLeft" || e.key === "a") {
      inputs.current.x = -1;
    } else if (e.key === "ArrowRight" || e.key === "d") {
      inputs.current.x = 1;
    }
  });

  const keyUpListener = useRef((e: KeyboardEvent) => {
    if ((e.key === "ArrowUp" || e.key === "w") && inputs.current.y === -1) {
      inputs.current.y = 0;
    } else if (
      (e.key === "ArrowDown" || e.key === "s") &&
      inputs.current.y === 1
    ) {
      inputs.current.y = 0;
    }

    if ((e.key === "ArrowLeft" || e.key === "a") && inputs.current.x === -1) {
      inputs.current.x = 0;
    } else if (
      (e.key === "ArrowRight" || e.key === "d") &&
      inputs.current.x === 1
    ) {
      inputs.current.x = 0;
    }
  });

  useEffect(() => {
    const kd = keyDownListener.current;
    const ku = keyUpListener.current;
    document.addEventListener("keydown", kd);
    document.addEventListener("keyup", ku);

    return () => {
      document.removeEventListener("keydown", kd);
      document.removeEventListener("keyup", ku);
    };
  }, []);

  useTick((delta) => {
    if (!position) {
      setPosition({ x: 0, y: 0 });
      return;
    }

    const magnitude = Math.sqrt(inputs.current.x ** 2 + inputs.current.y ** 2);
    if (magnitude === 0) {
      setAnimation((prev) => {
        if (prev === "walk_up") {
          return "idle_up";
        } else if (prev === "walk_down") {
          return "idle_down";
        } else if (prev === "walk_left") {
          return "idle_left";
        } else if (prev === "walk_right") {
          return "idle_right";
        }
        return prev;
      });
      return;
    }

    const velocity = {
      x: (inputs.current.x * MAX_SPEED) / magnitude,
      y: (inputs.current.y * MAX_SPEED) / magnitude,
    };

    setPosition((prev) => ({
      x: prev!.x + velocity.x * delta,
      y: prev!.y + velocity.y * delta,
    }));

    if (velocity.x > 0 && Math.abs(velocity.x) > Math.abs(velocity.y)) {
      setAnimation("walk_right");
    } else if (velocity.x < 0 && Math.abs(velocity.x) > Math.abs(velocity.y)) {
      setAnimation("walk_left");
    } else if (velocity.y > 0 && Math.abs(velocity.y) > Math.abs(velocity.x)) {
      setAnimation("walk_down");
    } else if (velocity.y < 0 && Math.abs(velocity.y) > Math.abs(velocity.x)) {
      setAnimation("walk_up");
    }

    netcode.setMyPosition({ x: position.x, y: position.y });
  });

  if (!position) {
    return null;
  }

  return (
    <Character
      x={position.x}
      y={position.y}
      username={username}
      animation={animation}
    />
  );
}
