import { AnimatedSprite, Container, Graphics, Sprite, Text } from "@pixi/react";
import {
  BaseTexture,
  Circle,
  DisplayObject,
  Graphics as G,
  Spritesheet,
  TextStyle,
  Texture,
} from "pixi.js";
import { useCallback, useEffect, useState } from "react";
import { useMount } from "react-use";

type Props = {
  x: number;
  y: number;
  username: string;
};

export function Character({ x, y, username }: Props) {
  const [walkDownTextures, setWalkDownTextures] = useState<Texture[] | null>(
    null
  );

  useMount(() => {
    const atlasData = {
      frames: {},
      meta: {
        image: "/character.png",
        format: "RGBA8888",
        size: { w: 512, h: 512 },
        scale: "0.5",
      },
      animations: {
        walk_down: ["1", "2"], //array of frames by name
      },
    };

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        (atlasData.frames as any)[`${row * 16 + col + 1}`] = {
          frame: {
            x: col * 64,
            y: row * 64,
            w: 64,
            h: 64,
          },
          sourceSize: {
            w: 64,
            h: 64,
          },
          spriteSourceSize: {
            x: 0,
            y: 0,
            h: 64,
            w: 64,
          },
        };
      }
    }

    console.log(atlasData);

    const spriteSheet = new Spritesheet(
      BaseTexture.from(atlasData.meta.image),
      atlasData
    );

    spriteSheet.parse().then((p) => {
      setWalkDownTextures(spriteSheet.animations["walk_down"]);
    });
  });

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
      {walkDownTextures && (
        <AnimatedSprite
          isPlaying={true}
          animationSpeed={0.01}
          textures={walkDownTextures}
        />
      )}
      <Graphics draw={draw} />
    </Container>
  );
}
