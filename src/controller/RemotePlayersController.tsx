"use-client";

import { CharacterName } from "@/components/CharacterSelector";
import { AnimationState } from "@/model/AnimationState";
import { Player } from "@/model/Player";
import { Vector2 } from "@/model/Vector2";
import { useRemoteParticipants } from "@livekit/components-react";
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

  const remoteCharacterLookup = useMemo(() => {
    const lookup = new Map<string, CharacterName>();
    for (const rp of remoteParticipants) {
      const metadata = JSON.parse(rp.metadata || "{}");
      lookup.set(rp.identity, metadata.character || ("doux" as CharacterName));
    }
    return lookup;
  }, [remoteParticipants]);

  const applyNetworkValues = useCallback(() => {
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
          position:
            previousPlayersLookup.get(identity)?.position ||
            networkPositions.get(identity)!, // use the network position if we don't have a previous one
          animation: networkAnimations.get(identity)!,
          character: remoteCharacterLookup.get(identity)! || "doux",
        }));

      // Crude interpolation that tries to match the 0.1 second send interval
      for (const p of newRemotePlayers) {
        p.position = {
          x:
            p.position.x +
            (networkPositions.get(p.username)!.x - p.position.x) * (10 / 30),
          y:
            p.position.y +
            (networkPositions.get(p.username)!.y - p.position.y) * (10 / 30),
        };
      }

      return newRemotePlayers;
    });
  }, [
    networkAnimations,
    networkPositions,
    remoteCharacterLookup,
    remoteParticipants,
    setRemotePlayers,
  ]);

  useInterval(applyNetworkValues, 1000 / 30);

  return null;
}
