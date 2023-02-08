import { Inputs } from "@/model/Inputs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";

type Props = {
  setInputs: Dispatch<SetStateAction<Inputs>>;
};

export const InputController = ({ setInputs }: Props) => {
  const keyDownListener = useCallback(
    (e: KeyboardEvent) => {
      setInputs((prev) => {
        const newInputs = { ...prev };
        if (e.key === "ArrowUp" || e.key === "w") {
          newInputs.direction.y = -1;
        } else if (e.key === "ArrowDown" || e.key === "s") {
          newInputs.direction.y = 1;
        }

        if (e.key === "ArrowLeft" || e.key === "a") {
          newInputs.direction.x = -1;
        } else if (e.key === "ArrowRight" || e.key === "d") {
          newInputs.direction.x = 1;
        }
        return newInputs;
      });
    },
    [setInputs]
  );

  const keyUpListener = useCallback(
    (e: KeyboardEvent) => {
      setInputs((prev) => {
        const newInputs = { ...prev };
        if ((e.key === "ArrowUp" || e.key === "w") && prev.direction.y === -1) {
          newInputs.direction.y = 0;
        } else if (
          (e.key === "ArrowDown" || e.key === "s") &&
          prev.direction.y === 1
        ) {
          newInputs.direction.y = 0;
        }

        if (
          (e.key === "ArrowLeft" || e.key === "a") &&
          prev.direction.x === -1
        ) {
          newInputs.direction.x = 0;
        } else if (
          (e.key === "ArrowRight" || e.key === "d") &&
          prev.direction.x === 1
        ) {
          newInputs.direction.x = 0;
        }

        return newInputs;
      });
    },
    [setInputs]
  );

  useEffect(() => {
    document.addEventListener("keydown", keyDownListener);
    document.addEventListener("keyup", keyUpListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
      document.removeEventListener("keyup", keyUpListener);
    };
  }, [keyDownListener, keyUpListener]);

  return null;
};
