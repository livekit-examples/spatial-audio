import { NetcodeController } from "@/controller/NetcodeController";
import {
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useSpeakingParticipants,
} from "@livekit/components-react";
import { Container, Stage } from "@pixi/react";
import { useMemo } from "react";
import useResizeObserver from "use-resize-observer";
import { Character } from "./Character";
import { InputController } from "@/controller/InputController";
import { useGameState } from "@/model/GameState";
import { MyCharacterController } from "@/controller/MyCharacterController";
import { MyPlayerSpawnController } from "@/controller/MyPlayerSpawnController";
import { ConnectionState } from "livekit-client";
import { SpatialAudioController } from "@/controller/SpatialAudioController";
import { RemotePlayersController } from "@/controller/RemotePlayersController";
import { WorldBoundaryController } from "@/controller/WorldBoundaryController";
import { World } from "./World";
import { Camera } from "./Camera";
import { EarshotRadius } from "./EarshotRadius";

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
    worldBoundaries,
    earshotRadius,
    backgroundZIndex,
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
          maxHearableDistance={earshotRadius}
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
      <MyPlayerSpawnController
        myPlayer={myPlayer}
        setMyPlayer={setMyPlayer}
        localParticipant={localParticipant}
      />
      <Stage
        className="absolute top-0 left-0 bottom-0 right-0"
        raf={true}
        renderOnComponentChange={false}
        width={width}
        height={height}
        options={{ resolution: 2 }}
      >
        <Camera targetPosition={myPlayer?.position || { x: 0, y: 0 }}>
          {/* @ts-ignore */}
          <Container anchor={[0.5, 0.5]} sortableChildren={true}>
            <MyCharacterController inputs={inputs} setMyPlayer={setMyPlayer} />
            {myPlayer && (
              <WorldBoundaryController
                worldBoundaries={worldBoundaries}
                myPlayer={myPlayer}
                setMyPlayer={setMyPlayer}
              />
            )}
            {myPlayer && (
              <Character
                speaking={localSpeaking}
                username={myPlayer.username}
                x={myPlayer.position.x}
                y={myPlayer.position.y}
                animation={myPlayer.animation}
              />
            )}
            <World
              backgroundZIndex={backgroundZIndex}
              worldBoundaries={worldBoundaries}
            />
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
            <EarshotRadius
              backgroundZIndex={backgroundZIndex}
              render={true}
              earshotRadius={earshotRadius}
              myPlayerPosition={myPlayer?.position || { x: 0, y: 0 }}
            />
          </Container>
        </Camera>
      </Stage>
    </div>
  );
}
