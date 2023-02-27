import { AnimationState } from "@/model/AnimationState";
import { useAnimations } from "@/providers/animations";
import { AnimatedSprite, Container, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import { useMemo } from "react";
import { CharacterName } from "./CharacterSelector";

type Props = {
  x: number;
  y: number;
  speaking: boolean;
  username: string;
  animation: AnimationState;
  character: CharacterName;
};

export function Character({
  x,
  y,
  username,
  animation,
  speaking,
  character,
}: Props) {
  const animationSheet = useAnimations(character);

  const { color: usernameOutlineColor, thickness: usernameOutlineThickness } =
    useMemo(() => {
      if (speaking) {
        return { color: 0x00ff00, thickness: 6 };
      } else {
        return { color: 0x000000, thickness: 4 };
      }
    }, [speaking]);

  const animationName = useMemo(
    () => (animation.startsWith("idle_") ? "idle" : "walk"),
    [animation]
  );

  const scale = useMemo(
    () => (animation.endsWith("_right") ? 1 : -1),
    [animation]
  );

  return (
    // @ts-ignore
    // pixi-react types don't support React 18 yet
    // See: https://github.com/pixijs/pixi-react/issues/350
    <Container position={[x, y]} zIndex={y} sortableChildren={true}>
      <Text
        anchor={[0.5, 1]}
        x={0}
        y={-60}
        text={username}
        style={
          new TextStyle({
            fill: "0xffffff",
            stroke: usernameOutlineColor,
            strokeThickness: usernameOutlineThickness,
          })
        }
      />
      {["walk", "idle"].map(
        (a) =>
          animationName === a && (
            <AnimatedSprite
              key={a}
              scale={[scale, 1]}
              anchor={[0.5, 0.65]}
              isPlaying={true}
              animationSpeed={0.15}
              textures={animationSheet[animationName]}
            />
          )
      )}
    </Container>
  );
}
