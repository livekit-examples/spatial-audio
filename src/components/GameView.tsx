import { useNetcode } from "@/controller/netcode";
import {
  useIsSpeaking,
  useLocalParticipant,
  useSpeakingParticipants,
} from "@livekit/components-react";
import { Container, Stage } from "@pixi/react";
import { useMemo } from "react";
import useResizeObserver from "use-resize-observer";
import { Character } from "./Character";
import { MyCharacter } from "./MyCharacter";

export function GameView() {
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const { localParticipant } = useLocalParticipant();
  const netcodeData = useNetcode();
  const localSpeaking = useIsSpeaking(localParticipant);
  const speakingParticipants = useSpeakingParticipants();

  const speakingLookup = useMemo(() => {
    const lookup = new Set<string>();
    for (const p of speakingParticipants) {
      lookup.add(p.identity);
    }
    return lookup;
  }, [speakingParticipants]);

  return (
    <div ref={ref} className="relative h-full w-full bg-red-400">
      <Stage
        className="absolute top-0 left-0 bottom-0 right-0"
        raf={true}
        renderOnComponentChange={false}
        width={width}
        height={height}
        options={{ resolution: 2 }}
      >
        {/* @ts-ignore */}
        <Container anchor={[0.5, 0.5]} sortableChildren={true}>
          {/* We need to pass in the position data here because react will not keep contexts
        across different renderers. See: https://github.com/facebook/react/issues/14101 */}
          <MyCharacter
            speaking={localSpeaking}
            username={localParticipant.identity}
            netcode={netcodeData}
          />

          {netcodeData.remotePlayers.map((player) => (
            <Character
              speaking={speakingLookup.has(player.identity)}
              username={player.identity}
              key={player.identity}
              x={player.position.x}
              y={player.position.y}
              animation={player.animation}
            />
          ))}
        </Container>
      </Stage>
    </div>
  );
}
