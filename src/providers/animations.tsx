"use-client";

import { CharacterName } from "@/components/CharacterSelector";
import { useApp } from "@pixi/react";
import {
  BaseTexture,
  Cache,
  Resource,
  SCALE_MODES,
  Spritesheet,
  Texture,
} from "pixi.js";
import React, { useCallback, useContext, useEffect, useState } from "react";

const atlasDataGenerator = (name: CharacterName) => {
  const baseAtlas = {
    frames: {},
    meta: {
      image: `/characters/${name}.png`,
      format: "RGBA8888",
      size: { w: 576, h: 24 },
      scale: "0.32",
    },
    animations: {
      walk: [
        `4_${name}`,
        `5_${name}`,
        `6_${name}`,
        `7_${name}`,
        `8_${name}`,
        `9_${name}`,
      ],
      idle: [`0_${name}`, `1_${name}`, `2_${name}`, `3_${name}`],
    },
  };
  for (let row = 0; row < 1; row++) {
    for (let col = 0; col < 24; col++) {
      (baseAtlas.frames as any)[`${row * 8 + col}_${name}`] = {
        frame: {
          x: col * 24,
          y: row * 24,
          w: 24,
          h: 24,
        },
        sourceSize: {
          w: 24,
          h: 24,
        },
        spriteSourceSize: {
          x: 0,
          y: 0,
          h: 24,
          w: 24,
        },
      };
    }
  }
  return baseAtlas;
};

type Animations = {
  walk: Texture<Resource>[];
  idle: Texture<Resource>[];
};

type Data = {
  animations: {
    [key in CharacterName]: Animations;
  };
};

const defaultValue: Data = {
  animations: {
    doux: { walk: [], idle: [] },
    mort: { walk: [], idle: [] },
    targ: { walk: [], idle: [] },
    vita: { walk: [], idle: [] },
  },
};

const AnimationsContext = React.createContext({
  _provider: false,
  data: defaultValue,
});

type Props = {
  children: React.ReactNode;
};

export function AnimationsProvider({ children }: Props) {
  const [animations, setAnimations] = useState<{
    [key in CharacterName]: Animations;
  }>(defaultValue.animations);

  const loadAnimations = useCallback(async () => {
    const atlases = [
      atlasDataGenerator("doux"),
      atlasDataGenerator("mort"),
      atlasDataGenerator("targ"),
      atlasDataGenerator("vita"),
    ];
    const [doux, mort, targ, vita] = atlases.map(
      (atlas) =>
        new Spritesheet(
          BaseTexture.from(atlas.meta.image, {
            scaleMode: SCALE_MODES.NEAREST,
          }),
          atlas
        )
    );

    await doux.parse();
    await mort.parse();
    await targ.parse();
    await vita.parse();

    const animations: { [key in CharacterName]: Animations } = {
      doux: { walk: doux.animations["walk"], idle: doux.animations["idle"] },
      mort: { walk: mort.animations["walk"], idle: mort.animations["idle"] },
      targ: { walk: targ.animations["walk"], idle: targ.animations["idle"] },
      vita: { walk: vita.animations["walk"], idle: vita.animations["idle"] },
    };

    setAnimations(animations);
  }, []);

  useEffect(() => {
    loadAnimations();

    return () => {
      Cache.reset();
    };
  }, [loadAnimations]);

  return (
    <AnimationsContext.Provider
      value={{
        _provider: true,
        data: { animations },
      }}
    >
      {children}
    </AnimationsContext.Provider>
  );
}

export function useAnimations(character: CharacterName) {
  const ctx = useContext(AnimationsContext);
  if (!ctx._provider) {
    throw "useAnimations must be used within a AnimationsProvider";
  }

  return ctx.data.animations[character];
}
