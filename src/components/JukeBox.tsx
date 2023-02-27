import { useJukeBox } from "@/controller/JukeBoxProvider";
import { Vector2 } from "@/model/Vector2";
import { Container, Graphics, Sprite, Text, useTick } from "@pixi/react";
import { SCALE_MODES, TextStyle, Texture } from "pixi.js";
import { useMemo, useState } from "react";

type Props = {
  position: Vector2;
  backgroundZIndex: number;
};

const BASE_SCALE = 2;

export const JukeBox = ({ position, backgroundZIndex }: Props) => {
  const { jukeBoxParticipant } = useJukeBox();
  const [jukeboxY, setJukeboxY] = useState(0);
  const [scale, setScale] = useState(BASE_SCALE);

  const jukeboxTexture = useMemo(() => {
    return Texture.from("/world/boombox.png", {
      scaleMode: SCALE_MODES.NEAREST,
    });
  }, []);

  useTick(() => {
    if (jukeBoxParticipant === null) {
      setScale(BASE_SCALE);
      setJukeboxY(0);
      return;
    }
    const newScale =
      BASE_SCALE + Math.abs(Math.sin((Date.now() * 8) / 1000) * 0.2);
    const newY = Math.abs(Math.sin((Date.now() * 8) / 1000) * 0.2) * -30;
    setScale(newScale);
    setJukeboxY(newY);
  });

  return (
    //@ts-ignore
    <Container
      zIndex={position.y}
      sortableChildren={true}
      anchor={[0.5, 0.05]}
      position={position}
    >
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
      <Sprite
        position={[0, jukeboxY]}
        scale={scale}
        anchor={[0.5, 0.5]}
        texture={jukeboxTexture}
      />
      <Graphics
        x={0}
        y={0}
        zIndex={backgroundZIndex + 1}
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 0.2);
          g.drawEllipse(0, 14, 35, 15);
          g.endFill();
        }}
      />
    </Container>
  );
};
