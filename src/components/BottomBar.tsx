import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";

export function BottomBar() {
  return (
    <div className="flex w-full h-full">
      <MicrophoneSelector />
      <MicrophoneMuteButton />
    </div>
  );
}
