import { useMicrophone } from "@/audio/microphone";
import { useEffect } from "react";

export function MicrophoneSelector() {
  const { selectedMicrophoneIndex, microphones, selectMicrophone } =
    useMicrophone();

  return (
    <div>
      <select
        onChange={(e) => {
          selectMicrophone(Number(e.currentTarget.value));
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
