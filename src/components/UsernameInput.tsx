import { useState } from "react";

type Props = {
  submitText: string;
  onSubmit: (username: string) => void;
};

export function UsernameInput({ submitText, onSubmit }: Props) {
  const [username, setUsername] = useState("");
  return (
    <form
      className="flex"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username);
      }}
    >
      <input
        className="grow-3"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.currentTarget.value)}
        type="text"
      />
      <button onClick={() => setUsername(username)} className="grow-1">
        {submitText}
      </button>
    </form>
  );
}
