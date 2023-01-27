import { Stage } from "@pixi/react";
import useResizeObserver from "use-resize-observer";
import { MyCharacter } from "./MyCharacter";

export function GameView() {
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();

  return (
    <div ref={ref} className="relative h-full w-full bg-red-400">
      <Stage
        className="absolute top-0 left-0 bottom-0 right-0"
        raf={true}
        renderOnComponentChange={false}
        width={width}
        height={height}
        options={{ resolution: 2 }}
      >
        <MyCharacter />
      </Stage>
    </div>
  );
}
