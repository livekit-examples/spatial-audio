type JukeBoxState_Off = {
  type: "off";
};

type JukeBoxState_On = {
  type: "on";
  owner: string;
};

export type JukeBoxState = JukeBoxState_Off | JukeBoxState_On;
