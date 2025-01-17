import { useRemoteParticipant } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Vector2 } from "@/model/Vector2";

interface Props {
  participantId: string;
  position: Vector2;
  myPosition: Vector2;
  radius: number;
}

export function ParticipantVideo({ participantId, position, myPosition, radius }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const participant = useRemoteParticipant(participantId);
  const [smoothPosition, setSmoothPosition] = useState(position);

  // Add smooth position tracking
  useEffect(() => {
    const smoothFactor = 0.15;
    const animate = () => {
      setSmoothPosition(prev => ({
        x: prev.x + (position.x - prev.x) * smoothFactor,
        y: prev.y + (position.y - prev.y) * smoothFactor
      }));
      animationFrame = requestAnimationFrame(animate);
    };
    
    let animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [position]);

  useEffect(() => {
    if (!participant || !videoRef.current) return;
  
    const handleTrackSubscribed = async (track: any) => {
      if (track.kind === 'video') {
        try {
          const videoElement = videoRef.current;
          if (videoElement) {
            console.log('Attaching video track');
            track.attach(videoElement);
          }
        } catch (error) {
          console.error('Error attaching video:', error);
        }
      }
    };
  
    // Handle existing tracks
    const videoTrack = participant.getTrack(Track.Source.Camera)?.videoTrack;
    if (videoTrack) {
      handleTrackSubscribed(videoTrack);
    }
  
    participant.on('trackSubscribed', handleTrackSubscribed);
    
    return () => {
      participant.off('trackSubscribed', handleTrackSubscribed);
      const videoTrack = participant.getTrack(Track.Source.Camera)?.videoTrack;
      const videoElement = videoRef.current;
      if (videoTrack && videoElement) {
        console.log('Detaching video track');
        videoTrack.detach(videoElement);
      }
    };
  }, [participant]);
  // Calculate distance and visibility
  const distance = Math.sqrt(
    Math.pow(position.x - myPosition.x, 2) + 
    Math.pow(position.y - myPosition.y, 2)
  );
  const isInRange = distance <= radius;

  if (!isInRange) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        left: smoothPosition.x,
        top: smoothPosition.y - 100,
        transform: 'translate(-50%, -50%)',
        width: '120px',
        height: '90px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '2px solid white',
        backgroundColor: 'black',
        pointerEvents: 'none',
      }}
    >
      <video 
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
}