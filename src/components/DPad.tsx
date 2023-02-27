import DPadSvg from "@/components/icons/d-pad.svg";
import { TouchEvent, useCallback, useRef } from "react";

type Props = {
  onInput: (x: number, y: number) => void;
};

export const DPad = ({ onInput }: Props) => {
  const container = useRef<HTMLDivElement>(null);

  const calculateInput = useCallback((e: TouchEvent) => {
    if (!container.current) return { x: 0, y: 0 };
    const boundingRect = container.current.getBoundingClientRect();
    const paddedHeight = boundingRect.height * 0.8;

    // pad by 10px on each side to make it easier to acheive max input
    // clamp to -1 to 1 and invert y
    const x = Math.max(
      Math.min(
        (2 * (e.touches[0].clientX - boundingRect.left - 10)) /
          (boundingRect.width - 20) -
          1,
        1
      ),
      -1
    );
    const y =
      Math.max(
        Math.min(
          (2 * (e.touches[0].clientY - boundingRect.top - 10)) /
            (boundingRect.height - 20) -
            1,
          1
        ),
        -1
      ) * -1;

    return { x, y };
  }, []);

  const onTouchDown = useCallback(
    (e: TouchEvent) => {
      const input = calculateInput(e);
      onInput(input.x, input.y);
    },
    [calculateInput, onInput]
  );

  const onTouchUp = useCallback(
    (e: TouchEvent) => {
      onInput(0, 0);
    },
    [onInput]
  );

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      const input = calculateInput(e);
      onInput(input.x, input.y);
    },
    [calculateInput, onInput]
  );

  return (
    <div
      ref={container}
      className="relative w-full h-full select-none"
      onTouchMove={onTouchMove}
      onTouchStart={onTouchDown}
      onTouchEnd={onTouchUp}
    >
      <DPadSvg
        className="absolute top-0 left-0 right-0 bottom-0 touch-none"
        style={{ color: "rgba(0,0,0,0.3" }}
      />
    </div>
  );
};
