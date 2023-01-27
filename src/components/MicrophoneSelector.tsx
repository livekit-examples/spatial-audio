import { useMicrophone } from "@/audio/microphone";
import { useEffect, useMemo } from "react";

export function MicrophoneSelector() {
  const { selectedMicrophoneIndex, microphones } = useMicrophone();

  useEffect(() => {
    console.log("NEIL microphones", microphones);
  }, [microphones]);

  return (
    <div>
      <select
        onChange={(e) => {
          console.log("NEIL e", e.currentTarget.value);
        }}
        value={selectedMicrophoneIndex}
        className="select w-full max-w-xs"
      >
        <option value={-1} disabled>
          Choose your microphone
        </option>
        {microphones.map((m, idx) => (
          <option value={idx} key={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
