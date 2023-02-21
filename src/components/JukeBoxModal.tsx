import { useJukeBox } from "@/controller/JukeBoxProvider";
import {
  useLocalParticipant,
  useRemoteParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { LocalParticipant } from "livekit-client";
import { useEffect } from "react";

export const JukeBoxModal = () => {
  const {
    playJukeBox,
    amIPlayingJukeBox,
    stopJukeBox,
    jukeBoxTrack,
    someoneElsePlayingJukeBox,
    jukeBoxParticipant,
  } = useJukeBox();

  return (
    <div className="flex flex-col items-center p-4 bg-neutral rounded-md">
      <div className="text-primary font-bold text-2xl mb-1">
        Spatial Speaker
      </div>
      <div className="text-secondary italic mb-2 text-sm">
        (Play some spatially groovy tunes over WebRTC)
      </div>
      {!amIPlayingJukeBox && jukeBoxParticipant && (
        <>{jukeBoxParticipant} is playing the jukebox</>
      )}
      {!someoneElsePlayingJukeBox && (
        <button
          className="btn btn-accent select-none"
          onClick={() => {
            if (amIPlayingJukeBox) {
              stopJukeBox();
            } else {
              playJukeBox();
            }
          }}
        >
          {amIPlayingJukeBox ? "Stop" : "Play"}
        </button>
      )}
    </div>
  );
};
