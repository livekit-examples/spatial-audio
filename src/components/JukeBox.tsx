import { useJukeBox } from "@/controller/JukeBoxProvider";
import { Vector2 } from "@/model/Vector2";
import { Container, Graphics, Sprite, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { useEffect } from "react";

type Props = {
  position: Vector2;
  backgroundZIndex: number;
};

export const JukeBox = ({ position, backgroundZIndex }: Props) => {
  const { jukeBoxParticipant } = useJukeBox();

  useEffect(() => {
    console.log("NEIL", jukeBoxParticipant);
  }, [jukeBoxParticipant]);

  return (
    //@ts-ignore
    <Container sortableChildren={true} anchor={[0.5, 0.05]} position={position}>
      {jukeBoxParticipant && (
        //@ts-ignore
        <Text
          anchor={[0.5, 0.9]}
          x={0}
          y={-60}
          text={`${jukeBoxParticipant}'s Speaker`}
          style={
            new TextStyle({
              fill: "0xffffff",
              stroke: "0x000000",
              strokeThickness: 4,
            })
          }
        />
      )}
      <Graphics
        x={0}
        y={0}
        zIndex={backgroundZIndex + 1}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 0.2);
          g.drawCircle(0, 0, 30);
          g.endFill();
        }}
      />
    </Container>
  );
};
