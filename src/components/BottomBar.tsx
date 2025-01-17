import { useMobile } from "@/util/useMobile";
import { GithubLink } from "./GithubLink";
import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { PoweredByLiveKit } from "./PoweredByLiveKit";
import { TrackToggle } from "@livekit/components-react";
import { Track } from "livekit-client";

export function BottomBar() {
  const mobile = useMobile();
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex h-full">
        <MicrophoneMuteButton />
        <TrackToggle
          source={Track.Source.Camera}
          className="btn button-primary w-10 h-full p-0 m-0 px-1 ml-2"
        />
        <div className="">
          <MicrophoneSelector />
        </div>
      </div>
      <div className="pr-2 flex">
        {!mobile && (
          <div className="pr-2">
            <GithubLink />
          </div>
        )}
        <PoweredByLiveKit />
      </div>
    </div>
  );
}
