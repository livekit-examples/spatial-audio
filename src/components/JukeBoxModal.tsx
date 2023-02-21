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
    <div className="flex flex-col items-center p-4 bg-white rounded-md">
      <div>Disco JukeBox</div>
      <div>It&apos;s got one mode, and that&apos;s disco babyyyy</div>
      {!amIPlayingJukeBox && jukeBoxParticipant && (
        <>{jukeBoxParticipant} is playing the jukebox</>
      )}
      {!someoneElsePlayingJukeBox && (
        <button
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
