import { TrackSource, useTracks } from "@livekit/components-react";
import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { PoweredByLiveKit } from "./PoweredByLiveKit";

export function BottomBar() {
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex h-full">
        <MicrophoneMuteButton />
        <div className="">
          <MicrophoneSelector />
        </div>
      </div>
      <div className="pr-2">
        <PoweredByLiveKit />
      </div>
    </div>
  );
}
