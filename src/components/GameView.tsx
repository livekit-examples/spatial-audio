import { usePosition } from "@/controller/position";
import { Stage } from "@pixi/react";
import useResizeObserver from "use-resize-observer";
import { Character } from "./Character";
import { MyCharacter } from "./MyCharacter";

export function GameView() {
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const positionData = usePosition();

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
        {/* We need to pass in the position data here because react will not keep contexts
        across different renderers. See: https://github.com/facebook/react/issues/14101 */}
        <MyCharacter positionData={positionData} />
      </Stage>
    </div>
  );
}
