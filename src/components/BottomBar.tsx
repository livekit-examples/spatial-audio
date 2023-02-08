import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { PoweredByLiveKit } from "./PoweredByLiveKit";

export function BottomBar() {
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex h-full">
        <div className="max-w-[200px]">
          <MicrophoneSelector />
        </div>
        <MicrophoneMuteButton />
      </div>
      <div className="pr-2">
        <PoweredByLiveKit />
      </div>
    </div>
  );
}
