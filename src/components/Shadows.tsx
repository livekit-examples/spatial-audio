import { Player } from "@/model/Player";
import { Graphics } from "@pixi/react";

type Props = {
  myPlayer: Player | null;
  remotePlayers: Player[];
  backgroundZIndex: number;
};
export const Shadows = ({
  myPlayer,
  remotePlayers,
  backgroundZIndex,
}: Props) => {
  const players = [...remotePlayers, myPlayer];
  return (
    <>
      {players.map((player) => {
        if (!player) return null;
        const { x, y } = player.position;
        return (
          <Graphics
            key={player.username}
            x={x}
            y={y}
            zIndex={backgroundZIndex + 1}
            draw={(g) => {
              g.clear();
              g.beginFill(0x000000, 0.3);
              g.drawEllipse(0, 17, 15, 8);
              g.endFill();
            }}
          />
        );
      })}
    </>
  );
};
