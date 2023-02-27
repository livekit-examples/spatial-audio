import { WorldBoundaries } from "@/model/WorldBoundaries";
import { Sprite } from "@pixi/react";

type Props = {
  worldBoundaries: WorldBoundaries;
  backgroundZIndex: number;
};

export const World = ({ worldBoundaries, backgroundZIndex }: Props) => {
  return (
    <Sprite
      anchor={[0.5, 0.5]}
      zIndex={backgroundZIndex}
      image="/world/map.png"
    />
  );
};
