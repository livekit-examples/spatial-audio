import { Vector2 } from "@/model/Vector2";
import { Container, Graphics, Sprite } from "@pixi/react";

type Props = {
  position: Vector2;
  backgroundZIndex: number;
};

export const JukeBox = ({ position, backgroundZIndex }: Props) => {
  return (
    //@ts-ignore
    <Container sortableChildren={true} anchor={[0.5, 0.05]} position={position}>
      <Graphics
        x={0}
        y={0}
        zIndex={backgroundZIndex + 1}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 1);
          g.drawCircle(0, 0, 30);
          g.endFill();
        }}
      />
    </Container>
  );
};
