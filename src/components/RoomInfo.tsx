import { RoomInfo } from "@/pages/api/room_info/[room]";
import { useCallback, useEffect, useMemo, useState } from "react";
import { setIntervalAsync, clearIntervalAsync } from "set-interval-async";

type Props = {
  roomName: string;
};

const DEFAULT_ROOM_INFO: RoomInfo = { num_participants: 0 };

export function RoomInfo({ roomName }: Props) {
  const [roomInfo, setRoomInfo] = useState<RoomInfo>(DEFAULT_ROOM_INFO);

  const fetchRoomInfo = useCallback(async () => {
    const res = await fetch(`/api/room_info/${roomName}`);
    const roomInfo = (await res.json()) as RoomInfo;
    setRoomInfo(roomInfo);
  }, [roomName]);

  useEffect(() => {
    fetchRoomInfo();
    const interval = setIntervalAsync(fetchRoomInfo, 1000);
    return () => {
      clearIntervalAsync(interval);
    };
  }, [fetchRoomInfo]);

  return (
    <div>
      <div className="flex flex-col items-center">
        <span className="countdown font-mono text-6xl">
          <span style={{ "--value": roomInfo.num_participants } as any}></span>
        </span>
        <div className="text-xs">Participants currently in room</div>
      </div>
    </div>
  );
}
