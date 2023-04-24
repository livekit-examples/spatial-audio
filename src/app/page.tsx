"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");

  const joinRoom = useCallback(() => {
    if (roomName === "") {
      toast.error("Please enter a room name");
      return;
    }
    router.push(`/room/${roomName}`);
  }, [roomName, router]);

  return (
    <main>
      <Toaster />
      <div className="relative flex flex-col items-center justify-center h-screen w-screen">
        <h1 className="text-4xl mb-8 p-2">Spatial Audio LiveKit Example App</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            joinRoom();
          }}
        >
          <div className="form-control">
            <div className="input-group">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.currentTarget.value)}
                type="text"
                placeholder="Room Name"
                className="input input-bordered input-secondary"
              />
              <button className="btn">Enter Room</button>
            </div>
          </div>
        </form>
        <div className="absolute bottom-2 right-2">
          <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flivekit-examples%2Fspatial-audio&env=LIVEKIT_API_KEY,LIVEKIT_API_SECRET,LIVEKIT_WS_URL&envDescription=Get%20these%20from%20your%20cloud%20livekit%20project.&envLink=https%3A%2F%2Fcloud.livekit.io&project-name=my-spatial-audio-app">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="deploy with Vercel" src="https://vercel.com/button" />
          </a>
        </div>
      </div>
    </main>
  );
}
