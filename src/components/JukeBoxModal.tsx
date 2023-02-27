import { useJukeBox } from "@/controller/JukeBoxProvider";
import { useMobile } from "@/util/useMobile";
import { useCallback, useEffect, useMemo } from "react";

export const JukeBoxModal = () => {
  const {
    playJukeBox,
    amIPlayingJukeBox,
    stopJukeBox,
    jukeBoxTrack,
    someoneElsePlayingJukeBox,
    jukeBoxParticipant,
  } = useJukeBox();

  const isMobile = useMobile();

  const inner = useMemo(() => {
    if (amIPlayingJukeBox) {
      // I'm playing
      return isMobile ? (
        <div className="flex items-center">
          <div className="text-neutral-content max-w-[300px]">
            You are playing to the speaker
          </div>
          <button
            className="btn btn-outline btn-sm btn-primary m-2"
            onClick={stopJukeBox}
          >
            Stop
          </button>
        </div>
      ) : (
        <div className="text-neutral-content">
          You are playing to the speaker. Press{" "}
          <span className="font-bold">[x]</span> to stop.
        </div>
      );
    } else if (jukeBoxParticipant !== null) {
      // Someone else is playing
      return (
        <div className="text-neutral-content">
          <span className="font-bold">{jukeBoxParticipant}</span> is playing to
          the speaker
        </div>
      );
    } else {
      // No one is playing
      return isMobile ? (
        <div className="flex items-center">
          <div className="text-neutral-content w-[300px]">
            Want to listen to spatially groovy tunes over WebRTC? Press play.
          </div>
          <button
            className="btn btn-outline btn-sm btn-primary m-2"
            onClick={playJukeBox}
          >
            Play
          </button>
        </div>
      ) : (
        <div className="text-neutral-content max-w-[300px]">
          Press <span className="font-bold">[x]</span> to play spatially groovy
          tunes over WebRTC .
        </div>
      );
    }
  }, [
    amIPlayingJukeBox,
    isMobile,
    jukeBoxParticipant,
    playJukeBox,
    stopJukeBox,
  ]);

  const keyDownListener = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "x") {
        if (amIPlayingJukeBox) {
          stopJukeBox();
        } else {
          playJukeBox();
        }
      }
    },
    [amIPlayingJukeBox, playJukeBox, stopJukeBox]
  );

  useEffect(() => {
    if (isMobile) return;
    document.addEventListener("keydown", keyDownListener);

    return () => {
      document.removeEventListener("keydown", keyDownListener);
    };
  }, [isMobile, keyDownListener]);

  return (
    <div className="flex flex-col items-center p-4 bg-neutral rounded-md">
      {inner}
    </div>
  );
};
