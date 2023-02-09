import Image from "next/image";

export type CharacterName = "doux" | "mort" | "targ" | "vita";

type Props = {
  selectedCharacter: CharacterName;
  onSelectedCharacterChange: (character: CharacterName) => void;
};

export const CharacterSelector = ({
  selectedCharacter,
  onSelectedCharacterChange,
}: Props) => {
  return (
    <div>
      <div className="flex">
        <div
          className="m-2 cursor-pointer"
          onClick={() => onSelectedCharacterChange("doux")}
        >
          <Character
            name="doux"
            image="/characters/doux_preview.png"
            selected={selectedCharacter === "doux"}
          />
        </div>
        <div
          className="m-2 cursor-pointer"
          onClick={() => onSelectedCharacterChange("mort")}
        >
          <Character
            name="mort"
            image="/characters/mort_preview.png"
            selected={selectedCharacter === "mort"}
          />
        </div>
        <div
          className="m-2 cursor-pointer"
          onClick={() => onSelectedCharacterChange("targ")}
        >
          <Character
            name="targ"
            image="/characters/targ_preview.png"
            selected={selectedCharacter === "targ"}
          />
        </div>
        <div
          className="m-2 cursor-pointer"
          onClick={() => onSelectedCharacterChange("vita")}
        >
          <Character
            name="vita"
            image="/characters/vita_preview.png"
            selected={selectedCharacter === "vita"}
          />
        </div>
      </div>
    </div>
  );
};

const Character = ({
  name,
  image,
  selected,
}: {
  name: string;
  image: string;
  selected: boolean;
}) => {
  return (
    <div className="flex flex-col items-center h-full">
      <div className={`${selected ? "animate-bounce" : ""}`}>
        <Image
          quality={100}
          width={64}
          height={64}
          src={image}
          alt={name}
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <div>{name}</div>
    </div>
  );
};
