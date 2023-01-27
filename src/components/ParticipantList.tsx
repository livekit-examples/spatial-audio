import {
  ParticipantLoop,
  useParticipantContext,
} from "@livekit/components-react";

export function ParticipantList() {
  return (
    <div className="w-full h-full">
      <div className="flex flex-col items-center justify-center">
        <h2>Participants</h2>
        <div className="divider" />
      </div>
      <ul>
        <ParticipantLoop>
          <ParticipantListItem />
        </ParticipantLoop>
      </ul>
    </div>
  );
}

function ParticipantListItem() {
  const p = useParticipantContext();
  return <div>{p.identity}</div>;
}
