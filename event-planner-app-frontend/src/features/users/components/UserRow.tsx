import { Mail, ShieldCheck, Trash, User as UserIcon, X } from "lucide-react";
import { UserRole, type User } from "../types";
import { useEffect, useRef, useState } from "react";

import { useMatch } from "react-router";
import { isFetchBaseQueryError, isValidationError } from "../../api/utils";
import { useRemoveUserMutation, useUpdateUserMutation } from "../usersApiSlice";
import { EditableSelect } from "../../../components";
import { toast } from "sonner";

export default function UserRow({ user }: { user: User }) {
  const [userRole, setUserRole] = useState(user.role);
  const [removeUser, { isLoading: removeIsLoading }] = useRemoveUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const params = useMatch("/trips/:tripId")?.params;
  const tripId = Number(params?.tripId);

  const [isDeleteModal, setIsDeleteModalOpen] = useState(false);
  const menuRef = useRef<HTMLTableCellElement>(null);
  const { username, email } = user;

  useEffect(() => {
    setUserRole(user.role);
  }, [user]);

  async function remove() {
    try {
      await removeUser({ tripId, userId: user.id }).unwrap();
    } catch (err) {
      if (isValidationError(err)) {
        const serverErrors = err.data.error;
        if (err) {
          console.error(serverErrors);
        }
        if (err.status === 404) {
          toast.error("User not found.");
        } else if (err.status === 403) {
          toast.error("Not authorised.");
        }
      }
    }
  }

  async function updateRole(role: string) {
    const oldRole = userRole;
    try {
      setUserRole(role);
      await updateUser({
        tripId,
        userId: user.id,
        newUserData: { role },
      }).unwrap();
    } catch (err) {
      setUserRole(oldRole);
      if (isFetchBaseQueryError(err)) {
        switch (err.status) {
          case 400:
            toast.error("Cannot update role.");
            break;
          case 404:
            toast.error("User found.");
            break;
          case 403:
            toast.error("Not authorised.");
            break;
        }
      }
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsDeleteModalOpen(false);
      }
    };
    if (isDeleteModal)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDeleteModal]);

  const closeDeleteModal = () => setIsDeleteModalOpen(false);
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
          <EditableSelect
            canEdit
            defaultElement={<p>{userRole}</p>}
            selectedValue={userRole}
            options={Object.values(UserRole).map((value) => ({
              title: value[0].toUpperCase() + value.substring(1),
              value,
            }))}
            selectClassName="flex gap-2"
            setValue={updateRole}
          />
        </div>
      </td>

      <td ref={menuRef} className="pr-4  py-4 text-right ">
        <button
          onClick={() => setIsDeleteModalOpen(!isDeleteModal)}
          className="p-1 hover:bg-surface-muted rounded-full transition-colors"
        >
          <Trash size={18} className="text-text-secondary" />
        </button>

        {isDeleteModal && (
          <div className="backdrop" onClick={closeDeleteModal}>
            <div
              className="modal flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card border-brand-primary/80 p-0 overflow-clip w-[90vh] flex flex-col shadow-xl bg-surface text-left">
                <div>
                  <div className="p-4 bg-brand-primary flex gap-2 items-center justify-between">
                    <h3 className="title">Remove {username}?</h3>
                    <button onClick={closeDeleteModal} className="btn p-2">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="p-4 mt-4 flex justify-end gap-2">
                    <button
                      onClick={closeDeleteModal}
                      className="btn-secondary"
                    >
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
