import {
  ConnectionState,
  useLiveKitRoom,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import { useEffect } from "react";

type Props = {};

export function GameView() {
  const participants = useParticipants();
  return (
    <div>
      <ConnectionState />
    </div>
  );
}
