import {
  useLocalParticipant,
  useRemoteParticipant,
  useRemoteParticipants,
  useTracks,
} from "@livekit/components-react";
import { LocalParticipant } from "livekit-client";
import { useEffect } from "react";

export const JukeBoxModal = () => {
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-md">
      <div>Disco JukeBox</div>
      <div>It&apos;s got one mode, and that&apos;s disco babyyyy</div>
      <button onClick={() => {}}>Play</button>
    </div>
  );
};
