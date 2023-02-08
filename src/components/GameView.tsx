import { NetcodeController, useNetcode } from "@/controller/NetcodeController";
import {
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useSpeakingParticipants,
} from "@livekit/components-react";
import { Container, Stage } from "@pixi/react";
import { useEffect, useMemo } from "react";
import useResizeObserver from "use-resize-observer";
import { Character } from "./Character";
import { InputController } from "@/controller/InputController";
import { useGameState } from "@/model/GameState";
import { MyCharacterController } from "@/controller/MyCharacterController";
import { MyPlayerSpawnController } from "@/controller/MyPlayerSpawnController";
import { ConnectionState } from "livekit-client";
import { SpatialAudioController } from "@/controller/audio/SpatialAudioController";
import { RemotePlayersController } from "@/controller/RemotePlayersController";

const MAX_HEARABLE_DISTANCE = 300;

export function GameView() {
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const localSpeaking = useIsSpeaking(localParticipant);
  const speakingParticipants = useSpeakingParticipants();
  const {
    inputs,
    remotePlayers,
    myPlayer,
    networkAnimations,
    networkPositions,
    setMyPlayer,
    setInputs,
    setNetworkAnimations,
    setNetworkPositions,
    setRemotePlayers,
  } = useGameState();

  const speakingLookup = useMemo(() => {
    const lookup = new Set<string>();
    for (const p of speakingParticipants) {
      lookup.add(p.identity);
    }
    return lookup;
  }, [speakingParticipants]);

  if (connectionState !== ConnectionState.Connected) {
    return null;
  }

  return (
    <div ref={ref} className="relative h-full w-full bg-red-400">
      {myPlayer && (
        <SpatialAudioController
          myPlayer={myPlayer}
          remotePlayers={remotePlayers}
          maxHearableDistance={MAX_HEARABLE_DISTANCE}
        />
      )}
      {myPlayer && (
        <NetcodeController
          setNetworkAnimations={setNetworkAnimations}
          setNetworkPositions={setNetworkPositions}
          myPlayer={myPlayer}
        />
      )}
      <RemotePlayersController
        networkAnimations={networkAnimations}
        networkPositions={networkPositions}
        setRemotePlayers={setRemotePlayers}
      />
      <InputController setInputs={setInputs} />
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
          <MyPlayerSpawnController
            myPlayer={myPlayer}
            setMyPlayer={setMyPlayer}
            localParticipant={localParticipant}
          />
          <MyCharacterController inputs={inputs} setMyPlayer={setMyPlayer} />
          {myPlayer && (
            <Character
              speaking={myPlayer.speaking}
              username={myPlayer.username}
              x={myPlayer.position.x}
              y={myPlayer.position.y}
              animation={myPlayer.animation}
            />
          )}

          {remotePlayers.map((player) => (
            <Character
              speaking={speakingLookup.has(player.username)}
              username={player.username}
              key={player.username}
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
