import { useMobile } from "@/util/useMobile";
import { GithubLink } from "./GithubLink";
import { MicrophoneMuteButton } from "./MicrophoneMuteButton";
import { MicrophoneSelector } from "./MicrophoneSelector";
import { PoweredByLiveKit } from "./PoweredByLiveKit";

export function BottomBar() {
  const mobile = useMobile();
  return (
    <div className="flex w-full h-full justify-between">
      <div className="flex h-full">
        <MicrophoneMuteButton />
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
