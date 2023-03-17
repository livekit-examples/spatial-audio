import {
  useLocalParticipant,
  useRemoteParticipants,
} from "@livekit/components-react";
import { ParticipantEvent, TrackPublication } from "livekit-client";
import { useCallback, useEffect, useState } from "react";

export type TrackWithIdentity = {
  identity: string;
  track: TrackPublication;
};

export const useTracksByName = (name: string) => {
  const [tracks, setTracks] = useState<TrackWithIdentity[]>([]);
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();

  const _setTracks = useCallback(() => {
    const remoteTracks: TrackWithIdentity[] = remoteParticipants
      .map((p) => ({
        identity: p.identity,
        track: p.getTrackByName(name) as TrackPublication,
      }))
      .filter((t) => t.track);
    const res = [...remoteTracks];
    if (localParticipant.getTrackByName(name)) {
      res.push({
        identity: localParticipant.identity,
        track: localParticipant.getTrackByName(name) as TrackPublication,
      });
    }
    setTracks(res);
  }, [localParticipant, name, remoteParticipants]);

  const onRemoteTrackPublished = useCallback(() => _setTracks(), [_setTracks]);

  const onRemoteTrackUnpublished = useCallback(
    () => _setTracks(),
    [_setTracks]
  );

  const onLocalTrackPublished = useCallback(() => _setTracks(), [_setTracks]);

  const onLocalTrackUnpublished = useCallback(() => _setTracks(), [_setTracks]);

  useEffect(() => {
    _setTracks();

    remoteParticipants.forEach((p) => {
      p.on(ParticipantEvent.TrackPublished, onRemoteTrackPublished);
      p.on(ParticipantEvent.TrackUnpublished, onRemoteTrackUnpublished);
    }, []);

    localParticipant.on(
      ParticipantEvent.LocalTrackPublished,
      onLocalTrackPublished
    );
    localParticipant.on(
      ParticipantEvent.LocalTrackUnpublished,
      onLocalTrackUnpublished
    );

    return () => {
      remoteParticipants.forEach((p) => {
        p.off(ParticipantEvent.TrackPublished, onRemoteTrackPublished);
        p.off(ParticipantEvent.TrackUnpublished, onRemoteTrackUnpublished);
      }, []);

      localParticipant.off(
        ParticipantEvent.LocalTrackPublished,
        onLocalTrackPublished
      );
      localParticipant.off(
        ParticipantEvent.LocalTrackUnpublished,
        onLocalTrackUnpublished
      );
    };
  }, [
    _setTracks,
    localParticipant,
    onLocalTrackPublished,
    onLocalTrackUnpublished,
    onRemoteTrackPublished,
    onRemoteTrackUnpublished,
    remoteParticipants,
  ]);

  return tracks;
};
