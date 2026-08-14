export interface FormFieldProps {
  label?: string;
  name: string;
  touched?: boolean;
  errorMessage?: string;
  formClassNames?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  name,
  touched = true,
  errorMessage,
  formClassNames = "",
  children,
}: FormFieldProps) {
  const hasError = errorMessage && touched;

  return (
    <div
      className={
        "relative group flex flex-col text-text-main " + formClassNames
      }
    >
      {label && (
        <label
          htmlFor={name}
          className={`text-xs text-text-secondary pb-1 ${hasError ? "text-error" : ""}`}
        >
          {label}
        </label>
      )}
      {children}
      {hasError && (
        <p className="absolute text-xs -bottom-5 right-1 text-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
