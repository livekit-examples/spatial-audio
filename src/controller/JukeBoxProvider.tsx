import { Inputs } from "@/model/Inputs";
import { Player } from "@/model/Player";
import { useTick } from "@pixi/react";
import { Dispatch, SetStateAction, useCallback } from "react";

import React, { useContext } from "react";
import { useLocalParticipant } from "@livekit/components-react";

type Data = {
  playJukeBox: () => Promise<void>;
};

const defaultData: Data = {
  playJukeBox: () => Promise.resolve(),
};

type Props = {
  children: React.ReactNode;
};

export const JukeBoxContext = React.createContext<Data>(defaultData);

export const JukeBoxProvider = ({ children }: Props) => {
  const localParticipant = useLocalParticipant();
  const playJukeBox = useCallback(async () => {}, []);

  return (
    <JukeBoxContext.Provider value={defaultData}>
      {children}
    </JukeBoxContext.Provider>
  );
};

export function useJukeBox() {
  const ctx = useContext(JukeBoxContext);
  if (!ctx) {
    throw "useJukeBox must be used within a WebAudioProvider";
  }
  return ctx;
}
