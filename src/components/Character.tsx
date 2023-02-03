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
  const [animations, setAnimations] = useState<{
    [key: string]: Texture[];
  } | null>(null);

  useEffect(() => {
    const atlasData = {
      frames: {},
      meta: {
        image: "/character.png",
        format: "RGBA8888",
        size: { w: 512, h: 512 },
        scale: "0.5",
      },
      animations: {
        walk_down: ["32", "33", "34", "35", "36", "37"],
        walk_up: ["40", "41", "42", "43", "44", "45"],
        walk_right: ["48", "49", "50", "51", "52", "53"],
        walk_left: ["56", "57", "58", "59", "60", "61"],
      },
    };

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        (atlasData.frames as any)[`${row * 8 + col}`] = {
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
      setAnimations(spriteSheet.animations);
    });

    return () => {
      setAnimations(null);
      spriteSheet.destroy();
    };
  }, []);

  return (
    // @ts-ignore
    // pixi-react types don't support React 18 yet
    // See: https://github.com/pixijs/pixi-react/issues/350
    <Container position={[x, y]}>
      <Text
        anchor={[0.5, 0.5]}
        x={0}
        y={-60}
        text={username}
        style={new TextStyle({ fill: "0xffffff" })}
      />
      {animations && (
        <AnimatedSprite
          anchor={[0.5, 0.5]}
          isPlaying={true}
          animationSpeed={0.1}
          textures={animations["walk_right"]}
        />
      )}
    </Container>
  );
}
