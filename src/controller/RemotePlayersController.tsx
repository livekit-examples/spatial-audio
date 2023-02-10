"use-client";

import { CharacterName } from "@/components/CharacterSelector";
import { AnimationState } from "@/model/AnimationState";
import { Player } from "@/model/Player";
import { Vector2 } from "@/model/Vector2";
import { useRemoteParticipants } from "@livekit/components-react";
import { Participant } from "livekit-client";
import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";
import { useInterval } from "react-use";

type Props = {
  networkPositions: Map<string, Vector2>;
  networkAnimations: Map<string, AnimationState>;
  setRemotePlayers: Dispatch<SetStateAction<Player[]>>;
};

export function RemotePlayersController({
  networkPositions,
  networkAnimations,
  setRemotePlayers,
}: Props) {
  const remoteParticipants = useRemoteParticipants({});
  const _interpolatedPositions = useRef<Map<string, { x: number; y: number }>>(
    new Map()
  );

  const remoteCharacterLookup = useMemo(() => {
    const lookup = new Map<string, CharacterName>();
    for (const rp of remoteParticipants) {
      const metadata = JSON.parse(rp.metadata || "{}");
      lookup.set(rp.identity, metadata.character || ("doux" as CharacterName));
    }
    console.log("NEIL lookup", lookup);
    return lookup;
  }, [remoteParticipants]);

  const interpolatePositions = useCallback(() => {
    setRemotePlayers((previousRemotePlayers) => {
      const participantIdentities = remoteParticipants.map((rp) => rp.identity);
      const previousPlayersLookup = new Map<string, Player>();
      for (const rp of previousRemotePlayers) {
        previousPlayersLookup.set(rp.username, rp);
      }

      // cleanup players that no longer have a remote participant or
      // we haven't received network data yet and make copies to keep
      // react updates working
      const newRemotePlayers: Player[] = participantIdentities
        .filter(
          (identity) =>
            networkAnimations.has(identity) && networkPositions.has(identity)
        )
        .map((identity) => ({
          username: identity,
          position: networkPositions.get(identity)!,
          animation: networkAnimations.get(identity)!,
          character: remoteCharacterLookup.get(identity)! || "doux",
        }));

      // Crude interpolation that tries to match the 0.5 second send interval
      // for (const identity of targetKeys) {
      //   const currentPosition =
      //     _interpolatedPositions.current.get(identity) ||
      //     _playerPositions.current.get(identity);
      //   const targetPosition = _playerPositions.current.get(identity);
      //   const newPosition = {
      //     x:
      //       currentPosition!.x +
      //       (targetPosition!.x - currentPosition!.x) * (3 / TICK_FPS),
      //     y:
      //       currentPosition!.y +
      //       (targetPosition!.y - currentPosition!.y) * (3 / TICK_FPS),
      //   };
      //   _interpolatedPositions.current.set(identity, newPosition);
      // }

      return newRemotePlayers;
    });
  }, [
    networkAnimations,
    networkPositions,
    remoteCharacterLookup,
    remoteParticipants,
    setRemotePlayers,
  ]);

  const update = useCallback(() => {
    interpolatePositions();
  }, [interpolatePositions]);

  useInterval(update, 1000 / 30);

  return null;
}
