import { Mail, ShieldCheck, Trash, User as UserIcon, X } from "lucide-react";
import type { User } from "../types";
import { useEffect, useRef, useState } from "react";

import { useMatch } from "react-router";
import { isValidationError } from "../../api/utils";
import { useRemoveUserMutation } from "../usersApiSlice";

export default function UserRow({ user }: { user: User }) {
  const [removeUser, { isLoading: removeIsLoading }] = useRemoveUserMutation();
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLTableCellElement>(null);
  const { username, email, role } = user;

  async function remove() {
    try {
      removeUser({ tripId, userId: user.id }).unwrap();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        if (err) {
          console.error(serverErrors);
        }
        if (err.status === 404 || err.status === 403) {
          console.error("User not found");
          // TODO: Add toast notifcation
        }
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const closeModal = () => setIsMenuOpen(false);
  return (
    <tr className="group hover:bg-surface-muted/30 transition-colors text-sm md:text-current">
      <td className="px-2 pl-4 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 hidden md:block rounded-full bg-brand-primary/10 text-brand-primary">
            <UserIcon size={16} />
          </div>
          <span>{username}</span>
        </div>
      </td>
      <td className="px-2 md:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 hidden md:block rounded-full bg-brand-primary/10 text-brand-primary">
            <Mail size={16} />
          </div>
          <span>{email}</span>
        </div>
      </td>
      <td className="px-2 md:px-6 py-4">
        <div className="flex items-center justify-center gap-1.5 text-sm text-text-secondary capitalize">
          <ShieldCheck className="hidden md:flex" size={14} />
          {role}
        </div>
      </td>

      <td ref={menuRef} className="pr-4  py-4 text-right relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:bg-surface-muted rounded-full transition-colors"
        >
          <Trash size={18} className="text-text-secondary" />
        </button>

        {isMenuOpen && (
          <div className="backdrop" onClick={closeModal}>
            <div
              className="modal flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card border-brand-primary/80 p-0 overflow-clip w-[90vh] flex flex-col shadow-xl bg-surface text-left">
                <div>
                  <div className="p-4 bg-brand-primary flex gap-2 items-center justify-between">
                    <h3 className="title">Remove {username}?</h3>
                    <button onClick={closeModal} className="btn p-2">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 mt-4 flex justify-end gap-2">
                    <button onClick={closeModal} className="btn-secondary">
                      Cancel
                    </button>
                    <button
                      onClick={remove}
                      disabled={removeIsLoading}
                      className="btn-error"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}
