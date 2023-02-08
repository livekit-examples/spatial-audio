import { WorldBoundaries } from "@/model/WorldBoundaries";
import { Graphics } from "pixi.js";
import { useCallback } from "react";
import { Graphics as GraphicsComponent } from "@pixi/react";

type Props = {
  worldBoundaries: WorldBoundaries;
  backgroundZIndex: number;
};

export const World = ({ worldBoundaries, backgroundZIndex }: Props) => {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      g.beginFill(0xffffff);
      g.lineStyle(1, 0x888888, 1);
      g.drawRoundedRect(
        worldBoundaries.minX,
        worldBoundaries.minY,
        worldBoundaries.maxX - worldBoundaries.minX,
        worldBoundaries.maxY - worldBoundaries.minY,
        2
      );
      g.endFill();

      g.lineStyle(0, 0x000000, 0);
      g.beginFill(0x888888);
      for (
        let x = worldBoundaries.minX + 20;
        x < worldBoundaries.maxX;
        x += 20
      ) {
        for (
          let y = worldBoundaries.minY + 20;
          y < worldBoundaries.maxY;
          y += 20
        ) {
          g.drawCircle(x, y, 2);
        }
      }
      g.endFill();
    },
    [
      worldBoundaries.maxX,
      worldBoundaries.maxY,
      worldBoundaries.minX,
      worldBoundaries.minY,
    ]
  );

  return <GraphicsComponent zIndex={backgroundZIndex} draw={draw} />;
};
