import { useLocalParticipant } from "@livekit/components-react";
import { Track, createLocalVideoTrack } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { Vector2 } from "@/model/Vector2";

interface Props {
  position: Vector2;
}

export function LocalVideo({ position }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { localParticipant } = useLocalParticipant();
  const [smoothPosition, setSmoothPosition] = useState(position);

  useEffect(() => {
    const smoothFactor = 0.15; // Adjust this value to change smoothing (0-1)
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
    async function enableCamera() {
      try {
        // Create and publish local video track
        const videoTrack = await createLocalVideoTrack();
        await localParticipant?.publishTrack(videoTrack);
      } catch (error) {
        console.error('Error enabling camera:', error);
      }
    }

    if (localParticipant) {
      enableCamera();
    }
  }, [localParticipant]);

  useEffect(() => {
    if (!localParticipant || !videoRef.current) return;
    
    async function setupVideo() {
      try {
        // First enable camera
        await localParticipant.enableCameraAndMicrophone();
        
        // Then create and publish track
        const videoTrack = await createLocalVideoTrack({
          resolution: { width: 320, height: 240 }
        });
        await localParticipant.publishTrack(videoTrack);
        
        const videoElement = videoRef.current;
        if (videoElement) {
          videoTrack.attach(videoElement);
        }
      } catch (error) {
        console.error('Error setting up video:', error);
      }
    }
    
    setupVideo();
    
    return () => {
      const videoTrack = localParticipant.getTrack(Track.Source.Camera)?.videoTrack;
      const videoElement = videoRef.current;
      if (videoTrack && videoElement) {
        videoTrack.detach(videoElement);
      }
    };
  }, [localParticipant]);

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
        muted
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>
  );
} 