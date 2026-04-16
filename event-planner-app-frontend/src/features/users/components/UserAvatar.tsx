import { useState } from "react";
import type { User } from "../types";
import { getAvatarColor } from "../utils";

export default function UserAvatar({ email, username, id }: User) {
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <div
      style={{ backgroundColor: getAvatarColor(id) }}
      onMouseLeave={() => setShowTooltip(false)}
      onMouseEnter={() => setShowTooltip(true)}
      className={`relative text-text-inverse w-10 h-10 flex items-center justify-center rounded-full font-bold`}
    >
      {username.charAt(0)}

      <div
        role="tooltip"
        className={`absolute z-10 -top-10 shadow-md right-0 inline-block px-3 py-2 text-sm font-medium text-text-primary  
            transition-opacity duration-300 bg-surface rounded-base   
            ${showTooltip ? "visible opacity-100" : "invisible  pointer-events-none opacity-0"}
            `}
      >
        {email}
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    </div>
  );
}
