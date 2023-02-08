import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";

export function BottomBar() {
  return (
    <div className="flex w-full h-full">
      <div className="flex h-full">
        <div className="max-w-[200px]">
          <MicrophoneSelector />
        </div>
        <MicrophoneMuteButton />
      </div>
    </div>
  );
}
