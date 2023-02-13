import { useMicrophone } from "@/providers/audio/microphone";
import Mic from "@/components/icons/mic.svg";
import MicOff from "@/components/icons/mic-off.svg";

export function MicrophoneMuteButton() {
  const { muted, setMuted } = useMicrophone();
  return (
    <div className="flex items-center">
      <button
        onClick={() => setMuted(!muted)}
        className="btn button-primary w-10 h-full p-0 m-0 px-1"
      >
        {muted ? (
          <MicOff className="text-gray-400" />
        ) : (
          <Mic className="text-white" />
        )}
      </button>
      <div
        className={`rounded-full w-2 h-2 p-1 ${
          muted ? "bg-gray-500" : "bg-red-500 animate-pulse"
        }`}
      />
    </div>
  );
}
