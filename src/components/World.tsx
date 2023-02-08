import { WorldBoundaries } from "@/model/WorldBoundaries";
import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Graphics as GraphicsComponent } from "@pixi/react";

type Props = {
  worldBoundaries: WorldBoundaries;
};

export const World = ({ worldBoundaries }: Props) => {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      g.beginFill(0xffffff);
      g.lineStyle(4, 0x888888, 1);
      g.drawRoundedRect(
        worldBoundaries.minX,
        worldBoundaries.minY,
        worldBoundaries.maxX - worldBoundaries.minX,
        worldBoundaries.maxY - worldBoundaries.minY,
        10
      );
      g.endFill();
    },
    [
      worldBoundaries.maxX,
      worldBoundaries.maxY,
      worldBoundaries.minX,
      worldBoundaries.minY,
    ]
  );

  return <GraphicsComponent draw={draw} />;
};
