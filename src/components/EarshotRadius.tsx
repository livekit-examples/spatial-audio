import { Vector2 } from "@/model/Vector2";
import { Graphics } from "pixi.js";
import { Graphics as GraphicsComponent } from "@pixi/react";
import { useCallback } from "react";

type Props = {
  earshotRadius: number;
  myPlayerPosition: Vector2;
  backgroundZIndex: number;
  render: boolean;
};

export const EarshotRadius = ({
  backgroundZIndex,
  myPlayerPosition,
  earshotRadius,
}: Props) => {
  const draw = useCallback(
    (g: Graphics) => {
      g.clear();
      g.beginFill(0xffffff, 0.1);
      g.drawCircle(myPlayerPosition.x, myPlayerPosition.y, earshotRadius);
      g.endFill();
    },
    [earshotRadius, myPlayerPosition.x, myPlayerPosition.y]
  );

  return <GraphicsComponent zIndex={backgroundZIndex + 1} draw={draw} />;
};
