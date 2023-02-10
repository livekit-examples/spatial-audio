import Image from "next/image";
import React from "react";

export const PoweredByLiveKit = () => {
  return (
    <div className="h-full">
      <a
        target="_blank"
        className="flex items-center h-full"
        rel="noreferrer"
        href="https://livekit.io"
      >
        <div className="text-xs text-primary mr-2">Powered by</div>
        <div className="h-full grow w-[60px] relative">
          <Image
            alt="livekit logo"
            style={{ objectFit: "contain" }}
            fill={true}
            src="/livekit/logo.svg"
          />
        </div>
      </a>
    </div>
  );
};
