export interface FormInputprops {
  label?: string;
  name: string;
  type?: string;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  onBlur?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  touched?: boolean;
  errorMessage?: string;
  options?: { name: string; value: string }[];
  formClassNames?: string;
  textarea?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export default function FormInput({
  label,
  name,
  type = "text",
  onChange,
  onBlur = () => {},
  touched = true,
  errorMessage,
  options,
  formClassNames = "",
  textarea = false,
  ref,
  ...props
}: FormInputprops) {
  return (
    <div className={"group flex flex-col text-text-main " + formClassNames}>
      {label && (
        <label
          htmlFor={name}
          className="group-focus-within:text-accent text-sm font-bold text-text-main mb-2"
        >
          {label}
        </label>
      )}
      {!options && !textarea && (
        <input
          id={name}
          className="w-full p-3 rounded-xl border border-border-light focus:outline-none focus:border-brand bg-bg-secondary text-text-main transition-all placeholder:text-text-sub/50"
          name={name}
          type={type}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref as React.Ref<HTMLInputElement>}
          {...props}
        />
      )}
      {options && !textarea && (
        <select
          className="w-full p-3 rounded-xl border border-border-light focus:outline-none focus:border-brand bg-bg-secondary text-text-main transition-all placeholder:text-text-sub/50"
          id={name}
          name={name}
          onChange={(e) => onChange(e)}
          onBlur={onBlur}
        >
          {options.map(({ name, value }) => (
            <option key={name} value={value}>
              {name}
            </option>
          ))}
        </select>
      )}
      {textarea && !options && (
        <textarea
          className="w-full p-3 rounded-xl border border-border-light focus:outline-none focus:border-brand bg-bg-secondary text-text-main transition-all resize-none"
          id={name}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          rows={6}
        />
      )}
      {errorMessage && touched && (
        <p className="mt-4 text-error bg-error/10 p-1 pl-4 rounded-md border-l-failure border-l-4">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
