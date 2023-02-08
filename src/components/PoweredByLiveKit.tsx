import Link from "next/link";
import React from "react";

export const PoweredByLiveKit = () => {
  return (
    <div className="h-full flex justify-center items-center text-secondary-focus">
      <a target="_blank" rel="noreferrer" href="https://livekit.io">
        Powered by LiveKit
      </a>
    </div>
  );
};
