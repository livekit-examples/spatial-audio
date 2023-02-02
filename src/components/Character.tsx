import { Container, Graphics, Sprite, Text } from "@pixi/react";
import { Circle, DisplayObject, Graphics as G, TextStyle } from "pixi.js";
import { useCallback, useEffect } from "react";

type Props = {
  x: number;
  y: number;
  username: string;
};

export function Character({ x, y, username }: Props) {
  const draw = useCallback((g: G) => {
    g.clear();
    g.beginFill(0xff3300);
    g.drawCircle(0, 0, 10);
    g.endFill();
  }, []);

  return (
    // @ts-ignore
    // pixi-react types don't support React 18 yet
    // See: https://github.com/pixijs/pixi-react/issues/350
    <Container anchor={[0.5, 0.5]} position={[x, y]}>
      <Text
        x={0}
        y={0}
        text={username}
        style={new TextStyle({ fill: "0xffffff" })}
      />
      <Graphics draw={draw} />
    </Container>
  );
}
