import { useMicrophone } from "@/providers/audio/microphone";
import { useMemo } from "react";

export function MicrophoneMuteButton() {
  const { muted, setMuted } = useMicrophone();
  const text = useMemo(() => (muted ? "Unmute" : "Mute"), [muted]);
  return (
    <div className="flex items-center">
      <button
        onClick={() => setMuted(!muted)}
        className="btn button-primary w-20"
      >
        {text}
      </button>
      <div
        className={`rounded-full w-2 h-2 m-2 ${
          muted ? "bg-gray-500" : "bg-red-500 animate-pulse"
        }`}
      />
    </div>
  );
}
