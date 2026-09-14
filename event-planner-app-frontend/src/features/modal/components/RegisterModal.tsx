import { useNavigate } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

interface RegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RegisterModal({
  open,
  onOpenChange,
}: RegisterModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="bg-brand-primary text-text-inverse p-4 -mx-4 -mt-4 rounded-t-xl">
          <DialogTitle>Create an account</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Create an account to unlock all features
        </DialogDescription>
        <DialogFooter>
          <button className="btn-primary" onClick={() => navigate("/register")}>
            Create account
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
