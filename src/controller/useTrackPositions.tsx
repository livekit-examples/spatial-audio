import { Player } from "@/model/Player";
import { Vector2 } from "@/model/Vector2";
import { TrackBundle } from "@livekit/components-core";
import { TrackSource, useTracks } from "@livekit/components-react";
import { Participant, RoomEvent, TrackPublication } from "livekit-client";
import { useMemo, useState } from "react";
import { TrackPosition } from "./SpatialAudioController";

type Props = {
  jukeBoxPosition: Vector2;
  remotePlayers: Player[];
};

export const useTrackPositions = ({
  jukeBoxPosition,
  remotePlayers,
}: Props) => {
  const [sourceFilter] = useState([
    TrackSource.Microphone,
    TrackSource.Unknown,
  ]);
  const [sourceOptions] = useState({
    updateOnlyOn: [RoomEvent.TrackPublished, RoomEvent.TrackUnpublished],
    onlySubscribed: false,
  });
  const trackParticipantPairs = useTracks(sourceFilter, sourceOptions);
  console.log("NEIL: ", trackParticipantPairs);
  const trackPositions: TrackPosition[] = useMemo(() => {
    const microphoneTrackLookup = new Map<string, TrackBundle>();
    let jukeboxTrackPublication: TrackPublication | null = null;
    let jukeboxParticipant: Participant | null = null;

    // Memoize all of the remote microphone tracks and the jukebox track
    trackParticipantPairs.forEach((tpp) => {
      if (tpp.publication.trackName === "jukebox") {
        jukeboxTrackPublication = tpp.publication;
        jukeboxParticipant = tpp.participant;
        return;
      }

      microphoneTrackLookup.set(tpp.participant.identity, tpp);
    });

    const res = remotePlayers
      .filter((p) => microphoneTrackLookup.has(p.username))
      .map((p) => {
        return {
          trackPublication: microphoneTrackLookup.get(p.username)!.publication,
          participant: microphoneTrackLookup.get(p.username)!.participant,
          position: p.position,
        };
      });

    if (jukeboxTrackPublication) {
      res.push({
        trackPublication: jukeboxTrackPublication,
        position: jukeBoxPosition,
        participant: jukeboxParticipant!,
      });
    }
    return res;
  }, [trackParticipantPairs, remotePlayers, jukeBoxPosition]);

  return trackPositions;
};
