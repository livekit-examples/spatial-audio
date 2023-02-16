import { NetcodeController } from "@/controller/NetcodeController";
import {
  TrackSource,
  useConnectionState,
  useIsSpeaking,
  useLocalParticipant,
  useMediaTrack,
  useParticipantInfo,
  useSpeakingParticipants,
  useTracks,
} from "@livekit/components-react";
import { Container } from "@pixi/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import useResizeObserver from "use-resize-observer";
import { Character } from "./Character";
import { InputController } from "@/controller/InputController";
import { useGameState } from "@/model/GameState";
import { MyCharacterController } from "@/controller/MyCharacterController";
import { MyPlayerSpawnController } from "@/controller/MyPlayerSpawnController";
import {
  ConnectionState,
  LocalTrackPublication,
  RoomEvent,
} from "livekit-client";
import {
  SpatialAudioController,
  TrackPosition,
} from "@/controller/SpatialAudioController";
import { RemotePlayersController } from "@/controller/RemotePlayersController";
import { WorldBoundaryController } from "@/controller/WorldBoundaryController";
import { World } from "./World";
import { Camera } from "./Camera";
import { EarshotRadius } from "./EarshotRadius";
import { AnimationsProvider } from "@/providers/animations";
import { Shadows } from "./Shadows";
import { CharacterEncoding } from "crypto";
import { CharacterName } from "./CharacterSelector";
import { DPad } from "./DPad";
import { Inputs } from "@/model/Inputs";
import { useMobile } from "@/util/useMobile";
import { Stage } from "./Stage";
import { JukeBox } from "./JukeBox";
import { JukeBoxModal } from "./JukeBoxModal";
import { JukeBoxProvider } from "@/controller/JukeBoxProvider";
import { TrackParticipantPair } from "@livekit/components-core";

export function GameView() {
  const { ref, width = 1, height = 1 } = useResizeObserver<HTMLDivElement>();
  const mobile = useMobile();
  const connectionState = useConnectionState();
  const { localParticipant } = useLocalParticipant();
  const { metadata: localMetadata } = useParticipantInfo({
    participant: localParticipant,
  });
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
    playerSpeed,
    jukeBoxPosition,
    setMyPlayer,
    setInputs,
    setNetworkAnimations,
    setNetworkPositions,
    setRemotePlayers,
  } = useGameState();

  const [mobileInputs, setMobileInputs] = useState<Inputs>({
    direction: { x: 0, y: 0 },
  });

  const microphoneTrackParticipantPairs = useTracks([TrackSource.Microphone], {
    updateOnlyOn: [RoomEvent.TrackPublished, RoomEvent.TrackUnpublished],
  });

  const speakingLookup = useMemo(() => {
    const lookup = new Set<string>();
    for (const p of speakingParticipants) {
      lookup.add(p.identity);
    }
    return lookup;
  }, [speakingParticipants]);

  useEffect(() => {
    if (localParticipant) {
      setMyPlayer((prev) => prev && { ...prev, character: "targ" });
    }
  }, [localParticipant, setMyPlayer]);

  const localCharacter = useMemo(
    () => JSON.parse(localMetadata || "{}").character || null,
    [localMetadata]
  );

  const onMobileInput = useCallback((x: number, y: number) => {
    setMobileInputs({ direction: { x, y: -y } });
  }, []);

  const distanceFromJukeBox = useMemo(() => {
    if (!myPlayer) return Infinity;
    return Math.sqrt(
      (myPlayer.position.x - jukeBoxPosition.x) ** 2 +
        (myPlayer.position.y - jukeBoxPosition.y) ** 2
    );
  }, [jukeBoxPosition.x, jukeBoxPosition.y, myPlayer]);

  const trackPositions: TrackPosition[] = useMemo(() => {
    // find all of the microphone tracks
    const microphoneTrackLookup = new Map<string, TrackParticipantPair>();
    microphoneTrackParticipantPairs.forEach((tpp) => {
      microphoneTrackLookup.set(tpp.participant.identity, tpp);
    });

    return remotePlayers
      .filter((p) => microphoneTrackLookup.has(p.username))
      .map((p) => {
        return {
          trackName: microphoneTrackLookup.get(p.username)!.track.trackName,
          participant: microphoneTrackLookup.get(p.username)!.participant,
          position: p.position,
        };
      });
  }, [microphoneTrackParticipantPairs, remotePlayers]);

  if (connectionState !== ConnectionState.Connected) {
    return null;
  }

  return (
    <div ref={ref} className="relative h-full w-full bg-red-400">
      {myPlayer && (
        <SpatialAudioController
          myPosition={myPlayer.position}
          trackPositions={trackPositions}
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
      <InputController mobileInputs={mobileInputs} setInputs={setInputs} />
      <MyPlayerSpawnController
        localCharacter={localCharacter}
        myPlayer={myPlayer}
        setMyPlayer={setMyPlayer}
        localParticipant={localParticipant}
      />
      <JukeBoxProvider>
        {distanceFromJukeBox < 20 && (
          <div className="absolute w-screen h-screen flex justify-center items-center z-10">
            <div className="shadow-md">
              <JukeBoxModal />
            </div>
          </div>
        )}
      </JukeBoxProvider>
      {mobile && (
        <div className="absolute bottom-20 left-5 w-[120px] h-[120px] z-10">
          <DPad onInput={onMobileInput} />
        </div>
      )}
      <Stage
        className="absolute top-0 left-0 bottom-0 right-0"
        raf={true}
        renderOnComponentChange={false}
        width={width}
        height={height}
        options={{ resolution: 2, backgroundColor: 0x509b66 }}
      >
        <AnimationsProvider>
          <Camera targetPosition={myPlayer?.position || { x: 0, y: 0 }}>
            {/* @ts-ignore */}
            <Container anchor={[0.5, 0.5]} sortableChildren={true}>
              <MyCharacterController
                playerSpeed={playerSpeed}
                inputs={inputs}
                setMyPlayer={setMyPlayer}
              />
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
                  character={myPlayer.character}
                  animation={myPlayer.animation}
                />
              )}
              <JukeBox
                backgroundZIndex={backgroundZIndex}
                position={jukeBoxPosition}
              />
              <World
                backgroundZIndex={backgroundZIndex}
                worldBoundaries={worldBoundaries}
              />
              <Shadows
                backgroundZIndex={backgroundZIndex}
                myPlayer={myPlayer}
                remotePlayers={remotePlayers}
              />
              {remotePlayers.map((player) => (
                <Character
                  speaking={speakingLookup.has(player.username)}
                  username={player.username}
                  key={player.username}
                  x={player.position.x}
                  y={player.position.y}
                  character={player.character}
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
        </AnimationsProvider>
      </Stage>
    </div>
  );
}
