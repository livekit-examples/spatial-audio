import { Vector2 } from "@/model/Vector2";
import { Container, useApp } from "@pixi/react";

type Props = {
  children?: React.ReactNode;
  targetPosition: Vector2;
};

export const Camera = ({ children, targetPosition }: Props) => {
  const app = useApp();
  console.log("NEIL app", app.screen.width, app.screen.height);

  return (
    //@ts-ignore
    <Container
      pivot={[
        targetPosition.x - app.screen.width / 2,
        targetPosition.y - app.screen.height / 2,
      ]}
    >
      {children}
    </Container>
  );
};
