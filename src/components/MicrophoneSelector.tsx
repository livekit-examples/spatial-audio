import { useMicrophone } from "@/providers/audio/microphone";
import { useMemo } from "react";
import SineWaveSvg from "./icons/sine-wave.svg";
import DiscoSVG from "./icons/disco-ball.svg";

export function MicrophoneSelector() {
  const { selectedMicrophoneIndex, microphones, selectMicrophone } =
    useMicrophone();

  const sineWaveIndex = useMemo(
    () => microphones.findIndex((m) => m.id === "sine-wave"),
    [microphones]
  );

  const discoIndex = useMemo(
    () => microphones.findIndex((m) => m.id === "audio-file"),
    [microphones]
  );

  return (
    <div className="px-2">
      <div className="flex items-center">
        <select
          onChange={(e) => {
            selectMicrophone(Number(e.currentTarget.value));
          }}
          value={selectedMicrophoneIndex}
          className="select select-sm w-full sm:max-w-[200px] max-w-[100px] m-2 select-none"
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
        <button
          className="text-white mr-1 h-[40px] select-none"
          onClick={() => {
            selectMicrophone(sineWaveIndex);
          }}
        >
          <div
            className={`w-[40px] h-full relative text-white py-2 ${
              selectedMicrophoneIndex === sineWaveIndex
                ? "text-accent-focus"
                : "text-white"
            }`}
          >
            <div className="tooltip" data-tip="Select sine wave microphone">
              <SineWaveSvg className="h-full w-full" />
            </div>
          </div>
        </button>
        <button
          className="text-white select-none"
          onClick={() => {
            selectMicrophone(discoIndex);
          }}
        >
          <div
            className={`w-[40px] h-full relative text-white py-2 ${
              selectedMicrophoneIndex === discoIndex
                ? "text-accent-focus"
                : "text-white"
            }`}
          >
            <div className="tooltip" data-tip="Select disco mode microphone">
              <DiscoSVG className="h-full w-full" />
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
