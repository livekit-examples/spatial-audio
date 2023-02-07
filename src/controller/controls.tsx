import { AnimationState } from "@/components/Character";
import { useEffect, useRef } from "react";

export type Inputs = {
  x: number;
  y: number;
};

export const useControls = () => {
  const inputs = useRef<Inputs>({ x: 0, y: 0 });

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

  return inputs;
};
