import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

export function MicrophoneMuteButton() {
  return (
    <div className="flex items-center">
      <TrackToggle
        source={Track.Source.Microphone}
        className="btn button-primary w-10 h-full p-0 m-0 px-1"
      />
    </div>
  );
}
