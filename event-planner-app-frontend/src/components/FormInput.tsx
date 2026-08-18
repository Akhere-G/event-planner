import { Input } from "./ui/input";
import FormField, { type FormFieldProps } from "./FormField";
import type { InputHTMLAttributes } from "react";

type Parent = Omit<FormFieldProps, "children"> &
  InputHTMLAttributes<HTMLInputElement>;

export interface FormInputProps extends Parent {
  ref?: React.Ref<HTMLInputElement>;
}

const FormInput = ({
  label,
  name,
  touched = true,
  errorMessage,
  formClassNames = "",
  ref,
  ...props
}: FormInputProps) => {
  const hasError = errorMessage && touched;

  return (
    <FormField
      label={label}
      name={name}
      touched={touched}
      errorMessage={errorMessage}
      formClassNames={formClassNames}
    >
      <Input
        id={name}
        name={name}
        ref={ref}
        className={hasError ? "border-error" : ""}
        {...props}
      />
    </FormField>
  );
};

export default FormInput;
