import { FormField, type FormFieldProps } from "./FormField";

export interface FormSelectProps extends Omit<FormFieldProps, 'children'> {
  value?: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { name: string; value: string }[];
  ref?: React.Ref<HTMLSelectElement>;
}

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur = () => {},
  touched = true,
  errorMessage,
  options,
  formClassNames = "",
  ref,
  ...props
}: FormSelectProps) => {
  const hasError = errorMessage && touched;

  return (
    <FormField
      label={label}
      name={name}
      touched={touched}
      errorMessage={errorMessage}
      formClassNames={formClassNames}
    >
      <select
        id={name}
        value={value}
        className={`form-input ${hasError ? "border-error" : ""}`}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        ref={ref}
        {...props}
      >
        {options.map(({ name, value }) => (
          <option key={name} value={value}>
            {name}
          </option>
        ))}
      </select>
    </FormField>
  );
};

export default FormSelect;
