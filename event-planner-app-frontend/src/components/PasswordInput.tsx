import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import FormInput, { type FormInputProps } from "./FormInput";
import { cn } from "../lib/utils";

type PasswordInputProps = Omit<FormInputProps, "type">;

const PasswordInput = ({ className, ...props }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <FormInput
        type={showPassword ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="p-0 absolute right-4 top-1/2  text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
};

export default PasswordInput;
