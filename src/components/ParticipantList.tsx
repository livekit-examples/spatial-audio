import {
  ParticipantLoop,
  useParticipantContext,
} from "@livekit/components-react";

export function ParticipantList() {
  return (
    <div className="w-full h-full">
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
