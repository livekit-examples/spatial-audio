import { Container, Graphics, Sprite } from "@pixi/react";
import { DisplayObject, Graphics as G } from "pixi.js";
import { useCallback, useEffect } from "react";

type Props = {
  x: number;
  y: number;
};

export function Character({ x, y }: Props) {
  const draw = useCallback(
    (g: G) => {
      g.clear();
      g.beginFill(0xff3300);
      g.drawCircle(x, y, 10);
      g.endFill();
    },
    [x, y]
  );

  return (
    // @ts-ignore
    // pixi-react types don't support React 18 yet
    // See: https://github.com/pixijs/pixi-react/issues/350
    <Container position={[0, 0]}>
      <Graphics draw={draw} />
    </Container>
  );
}
