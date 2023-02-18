"use client";

import { Vector2 } from "@/model/Vector2";
import { useMobile } from "@/util/useMobile";
import { useMediaTrack, useMediaTrackByName } from "@livekit/components-react";
import {
  Participant,
  RemoteAudioTrack,
  RemoteTrackPublication,
  Track,
  TrackPublication,
} from "livekit-client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWebAudioContext } from "../providers/audio/webAudio";

type RemoteParticipantPlaybackSubscriptionProps = {
  participant: Participant;
  trackPublication: TrackPublication;
  position: { x: number; y: number };
  myPosition: { x: number; y: number };
};

function RemoteParticipantPlaybackAudio({
  participant,
  trackPublication,
  position,
  myPosition,
}: RemoteParticipantPlaybackSubscriptionProps) {
  const mobile = useMobile();
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const audioContext = useWebAudioContext();
  const panner = useMemo(() => audioContext.createPanner(), [audioContext]);
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

  // set up panner node for desktop
  useEffect(() => {
    if (!(trackPublication.track instanceof RemoteAudioTrack) || mobile) {
      return;
    }
    panner.coneOuterAngle = 360;
    panner.coneInnerAngle = 360;
    panner.positionX.setValueAtTime(1000, 0); // set far away initially so we don't hear it at full volume
    panner.positionY.setValueAtTime(0, 0);
    panner.positionZ.setValueAtTime(0, 0);
    panner.distanceModel = "exponential";
    panner.coneOuterGain = 1;
    panner.refDistance = 100;
    panner.maxDistance = 500;
    panner.rolloffFactor = 2;
    trackPublication.track.attach(audioEl.current!);
    trackPublication.track.setWebAudioPlugins([panner]);
  }, [panner, mobile, trackPublication.track]);

  // On mobile we use a gain node because panner nodes have no effect
  // https://developer.apple.com/forums/thread/696034
  useEffect(() => {
    // for mobile we use the setVolume method and use a simple linear falloff
    if (mobile) {
      // const distance = Math.sqrt(
      //   relativePosition.x ** 2 + relativePosition.y ** 2
      // );
      // if (distance < 50) {
      //   participant.setVolume(1);
      // } else {
      //   if (distance > 250) {
      //     participant.setVolume(0);
      //     return;
      //   }
      //   participant.setVolume(1 - (distance - 50) / 200);
      // }
    } else {
      panner.positionX.setTargetAtTime(relativePosition.x, 0, 0.02);
      panner.positionZ.setTargetAtTime(relativePosition.y, 0, 0.02);
    }
  }, [mobile, relativePosition.x, relativePosition.y, panner, participant]);

  useEffect(() => {
    if (!(trackPublication instanceof RemoteTrackPublication)) {
      return;
    }
    trackPublication?.setSubscribed(true);
    return () => {
      trackPublication?.setSubscribed(false);
    };
  }, [trackPublication]);

  return (
    <>
      <audio muted={true} ref={audioEl} />
    </>
  );
}

type ParticipantPlaybackProps = {
  maxHearableDistance: number;
  participant: Participant;
  trackPublication: TrackPublication;
  myPosition: { x: number; y: number };
  position: { x: number; y: number };
};

function ParticipantPlayback({
  maxHearableDistance,
  participant,
  trackPublication,
  myPosition,
  position,
}: ParticipantPlaybackProps) {
  const distance = useMemo(() => {
    const dx = myPosition.x - position.x;
    const dy = myPosition.y - position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, [myPosition.x, myPosition.y, position.x, position.y]);

  const hearable = useMemo(
    () => distance <= maxHearableDistance,
    [distance, maxHearableDistance]
  );

  return (
    <div>
      {hearable && (
        <RemoteParticipantPlaybackAudio
          participant={participant}
          trackPublication={trackPublication}
          position={position}
          myPosition={myPosition}
        />
      )}
    </div>
  );
}

export type TrackPosition = {
  participant: Participant;
  trackPublication: TrackPublication;
  position: Vector2;
};

type PlaybackProviderProps = {
  trackPositions: TrackPosition[];
  myPosition: Vector2;
  maxHearableDistance: number;
};

export function SpatialAudioController({
  trackPositions,
  myPosition,
  maxHearableDistance,
}: PlaybackProviderProps) {
  const audioContext = useWebAudioContext();
  if (!audioContext) return null;
  return (
    <>
      {trackPositions.map((tp) => {
        return (
          <ParticipantPlayback
            maxHearableDistance={maxHearableDistance}
            key={`${tp.participant.identity}_${tp.trackPublication.trackSid}`}
            participant={tp.participant}
            trackPublication={tp.trackPublication}
            position={tp.position}
            myPosition={myPosition}
          />
        );
      })}
    </>
  );
}
