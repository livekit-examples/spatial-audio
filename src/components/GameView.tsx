import { useMyCharacter } from "@/controller/myCharacter";
import { usePosition } from "@/controller/position";
import { Stage } from "@pixi/react";
import useResizeObserver from "use-resize-observer";
import { Character } from "./Character";

export function GameView() {
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const { setMyPosition } = usePosition();
  const { position: myPosition } = useMyCharacter();

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
        {myPosition !== null && <Character x={myPosition.x} y={myPosition.y} />}
      </Stage>
    </div>
  );
}
