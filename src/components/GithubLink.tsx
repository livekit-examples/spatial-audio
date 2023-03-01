import Image from "next/image";
import React from "react";

export const GithubLink = () => {
  return (
    <div className="h-full">
      <a
        target="_blank"
        className="flex sm:flex-row flex-col items-center justify-center h-full"
        rel="noreferrer"
        href="https://github.com/livekit-examples/spatial-audio"
      >
        <div className="text-xs text-secondary sm:mr-2 mr-0">View Source</div>
        <div className="h-[30px] w-[30px] relative">
          <Image
            alt="livekit logo"
            style={{ objectFit: "contain" }}
            fill={true}
            src="/github.png"
          />
        </div>
      </a>
    </div>
  );
};
