import { useJukeBox } from "@/controller/JukeBoxProvider";
import { Vector2 } from "@/model/Vector2";
import { Container, Graphics, Sprite, Text } from "@pixi/react";
import { SCALE_MODES, TextStyle, Texture } from "pixi.js";
import { useEffect, useMemo } from "react";

type Props = {
  position: Vector2;
  backgroundZIndex: number;
};

export const JukeBox = ({ position, backgroundZIndex }: Props) => {
  const { jukeBoxParticipant } = useJukeBox();

  useEffect(() => {
    console.log("NEIL", jukeBoxParticipant);
  }, [jukeBoxParticipant]);

  const jukeboxTexture = useMemo(() => {
    return Texture.from("/world/boombox.png", {
      scaleMode: SCALE_MODES.NEAREST,
    });
  }, []);

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
      <Sprite scale={2} anchor={[0.5, 0.5]} texture={jukeboxTexture} />
      <Graphics
        x={0}
        y={0}
        zIndex={backgroundZIndex + 1}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 0.2);
          g.drawEllipse(0, 14, 40, 15);
          g.endFill();
        }}
      />
    </Container>
  );
};
