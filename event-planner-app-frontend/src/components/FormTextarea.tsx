import { Textarea } from "./ui/textarea";
import FormField, { type FormFieldProps } from "./FormField";

export interface FormTextareaProps extends Omit<FormFieldProps, "children"> {
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  ref?: React.Ref<HTMLTextAreaElement>;
  placeholder?: string;
}

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur = () => {},
  touched = true,
  errorMessage,
  formClassNames = "",
  ref,
  placeholder,
  ...props
}: FormTextareaProps) => {
  const hasError = errorMessage && touched;

  return (
    <FormField
      label={label}
      name={name}
      touched={touched}
      errorMessage={errorMessage}
      formClassNames={formClassNames}
    >
      <Textarea
        id={name}
        value={value}
        name={name}
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

export default FormTextarea;
