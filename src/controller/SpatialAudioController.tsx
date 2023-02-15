"use-client";

import { Player } from "@/model/Player";
import { useMobile } from "@/util/useMobile";
import { useRemoteParticipants, useTrack } from "@livekit/components-react";
import { RemoteParticipant, RemoteTrackPublication } from "livekit-client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useWebAudio } from "../providers/audio/webAudio";

type RemoteParticipantPlaybackSubscriptionProps = {
  publication: RemoteTrackPublication;
  position: { x: number; y: number };
  myPosition: { x: number; y: number };
};

function RemoteParticipantPlaybackAudio({
  publication,
  position,
  myPosition,
}: RemoteParticipantPlaybackSubscriptionProps) {
  const mobile = useMobile();
  const { track } = useTrack({ pub: publication });
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const { audioContext } = useWebAudio();

  const src = useRef<MediaStreamAudioSourceNode | null>(null);
  const panner = useRef<PannerNode | null>(null);
  const mobileGainNode = useRef<GainNode | null>(null);
  const [relativePosition, setRelativePosition] = useState<{
    x: number;
    y: number;
  }>({
    x: 1000,
    y: 1000,
  }); // set as far away initially

  // calculate relative position when position changes
  useEffect(() => {
    setRelativePosition((prev) => {
      return {
        x: position.x - myPosition.x,
        y: position.y - myPosition.y,
      };
    });
  }, [myPosition.x, myPosition.y, position.x, position.y]);

  // On mobile we use a gain node because panner nodes have no effect
  // https://developer.apple.com/forums/thread/696034
  useEffect(() => {
    // for mobile we use a gain node and use a simple linear falloff
    if (mobile) {
      if (!mobileGainNode.current) {
        return;
      }
      const distance = Math.sqrt(
        relativePosition.x ** 2 + relativePosition.y ** 2
      );
      if (distance < 50) {
        mobileGainNode.current.gain.setTargetAtTime(1, 0, 0.02);
      } else {
        if (distance > 250) {
          mobileGainNode.current.gain.setTargetAtTime(0, 0, 0.02);
          return;
        }

        mobileGainNode.current.gain.setTargetAtTime(
          1 - (distance - 50) / 200,
          0,
          0.02
        );
      }
    } else {
      if (!panner.current) {
        return;
      }

      panner.current.positionX.setTargetAtTime(relativePosition.x, 0, 0.02);
      panner.current.positionZ.setTargetAtTime(relativePosition.y, 0, 0.02);
    }
  }, [mobile, relativePosition.x, relativePosition.y]);

  const cleanupNodes = useCallback(() => {
    if (src.current) {
      src.current.disconnect();
      src.current = null;
    }
    if (panner.current) {
      panner.current.disconnect();
      panner.current = null;
    }
    if (mobileGainNode.current) {
      mobileGainNode.current.disconnect();
      mobileGainNode.current = null;
    }
  }, []);

  const connectNodes = useCallback(() => {
    if (!audioContext || !track || !track.mediaStream || !audioEl.current) {
      return;
    }

    if (src.current || panner.current) {
      cleanupNodes();
    }

    audioEl.current.srcObject = track.mediaStream;
    src.current = audioContext.createMediaStreamSource(
      audioEl.current.srcObject as any
    );

    // mobile panner nodes node supported so we use a gain node
    if (mobile) {
      mobileGainNode.current = audioContext.createGain();
      mobileGainNode.current.gain.setValueAtTime(0, 0);
      src.current
        .connect(mobileGainNode.current)
        .connect(audioContext.destination);
    } else {
      panner.current = audioContext.createPanner();
      panner.current.coneOuterAngle = 360;
      panner.current.coneInnerAngle = 360;
      panner.current.positionX.setValueAtTime(1000, 0); // set far away initially so we don't hear it at full volume
      panner.current.positionY.setValueAtTime(0, 0);
      panner.current.positionZ.setValueAtTime(0, 0);
      panner.current.distanceModel = "exponential";
      panner.current.coneOuterGain = 1;
      panner.current.refDistance = 100;
      panner.current.maxDistance = 500;
      panner.current.rolloffFactor = 2;

      src.current.connect(panner.current).connect(audioContext.destination);
    }

    audioEl.current.play();
    audioEl.current.autoplay = true;
    audioEl.current.muted = false;
    audioEl.current.volume = 0;
  }, [audioContext, cleanupNodes, mobile, track]);

  useEffect(() => {
    connectNodes();

    return () => {
      cleanupNodes();
    };
  }, [cleanupNodes, connectNodes]);

  useEffect(() => {
    publication.setSubscribed(true);

    return () => {
      publication.setSubscribed(false);
    };
  }, [publication]);

  useEffect(() => {}, []);
  return (
    <>
      <audio muted={true} ref={audioEl} />
    </>
  );
}

type RemoteParticipantPlaybackProps = {
  maxHearableDistance: number;
  participant: RemoteParticipant;
  myPosition: { x: number; y: number };
  position: { x: number; y: number };
};

function RemoteParticipantPlayback({
  maxHearableDistance,
  participant,
  myPosition,
  position,
}: RemoteParticipantPlaybackProps) {
  const distance = useMemo(() => {
    const dx = myPosition.x - position.x;
    const dy = myPosition.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [myPosition.x, myPosition.y, position.x, position.y]);

  const [publication, setPublication] = useState<RemoteTrackPublication | null>(
    null
  );

  const hearable = useMemo(
    () => distance <= maxHearableDistance,
    [distance, maxHearableDistance]
  );

  useEffect(() => {
    const onPublication = (publication: RemoteTrackPublication) => {
      if (publication.kind !== "audio") {
        return;
      }
      setPublication(publication);
    };

    // add existing tracks
    participant.tracks.forEach((pub) => {
      onPublication(pub);
    });

    participant.on("trackPublished", onPublication);

    return () => {
      participant.off("trackPublished", onPublication);
    };
  }, [participant]);

  return (
    <div>
      {hearable && publication && (
        <RemoteParticipantPlaybackAudio
          publication={publication}
          position={position}
          myPosition={myPosition}
        />
      )}
    </div>
  );
}

type PlaybackProviderProps = {
  maxHearableDistance: number;
  remotePlayers: Player[];
  myPlayer: Player;
};

export function SpatialAudioController({
  maxHearableDistance,
  remotePlayers,
  myPlayer,
}: PlaybackProviderProps) {
  const remoteParticipants = useRemoteParticipants({});

  const remoteParticipantLookup = useMemo(() => {
    const lookup = new Map<string, RemoteParticipant>();
    remoteParticipants.forEach((rp) => {
      lookup.set(rp.identity, rp as RemoteParticipant);
    });
    return lookup;
  }, [remoteParticipants]);

  return (
    <>
      {remotePlayers.map((player) => {
        const rp = remoteParticipantLookup.get(player.username);
        if (!rp) return null;
        return (
          <RemoteParticipantPlayback
            maxHearableDistance={maxHearableDistance}
            key={player.username}
            participant={rp as RemoteParticipant}
            position={player.position}
            myPosition={myPlayer.position}
          />
        );
      })}
    </>
  );
}
