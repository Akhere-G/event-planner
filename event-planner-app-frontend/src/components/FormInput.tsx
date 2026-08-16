import { Input } from "./ui/input";
import FormField, { type FormFieldProps } from "./FormField";

export interface FormInputProps extends Omit<FormFieldProps, "children"> {
  value?: string | number;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  ref?: React.Ref<HTMLInputElement>;
  placeholder?: string;
}

const FormInput = ({
  label,
  name,
  value,
  type = "text",
  onChange,
  onBlur = () => {},
  touched = true,
  errorMessage,
  formClassNames = "",
  ref,
  placeholder,
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
        value={value}
        name={name}
        type={type}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        placeholder={placeholder}
        className={hasError ? "border-error" : ""}
        {...props}
      />
    </FormField>
  );
};

export default FormInput;
