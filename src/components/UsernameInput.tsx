import { useState } from "react";

type Props = {
  submitText: string;
  onSubmit: (username: string) => void;
};

export function UsernameInput({ submitText, onSubmit }: Props) {
  const [username, setUsername] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(username);
      }}
    >
      <div className="form-control">
        <div className="input-group">
          <input
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            type="text"
            placeholder="Username"
            className="input input-bordered input-secondary"
          />
          <button className="btn">Join</button>
        </div>
      </div>
    </form>
  );
}
