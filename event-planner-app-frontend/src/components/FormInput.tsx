import { Tooltip } from "react-tooltip";

export interface FormInputprops {
  label?: string;
  name: string;
  value?: string | number;
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
  tooltipErrors?: boolean;
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
  options,
  formClassNames = "",
  textarea = false,
  tooltipErrors = false,
  ref,
  placeholder,
  ...props
}: FormInputprops) => {
  return (
    <div
      className={
        "relative group flex flex-col text-text-main " + formClassNames
      }
    >
      {label && (
        <label
          htmlFor={name}
          className={`group-focus-within:text-brand-primary text-xs  text-text-secondary pb-1
            ${tooltipErrors && errorMessage ? "text-error!" : ""}
            `}
        >
          {label}
        </label>
      )}
      {!options && !textarea && (
        <input
          id={name}
          value={value}
          data-tooltip-id={`${name}-tooltip`}
          className={`form-input ${tooltipErrors && errorMessage ? "border-error!" : ""}`}
          name={name}
          type={type}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref as React.Ref<HTMLInputElement>}
          placeholder={placeholder}
          {...props}
        />
      )}
      {options && !textarea && (
        <select
          id={name}
          data-tooltip-id={`${name}-tooltip`}
          value={value}
          className={`form-input ${tooltipErrors && errorMessage ? "border-error!" : ""}`}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          ref={ref as React.Ref<HTMLSelectElement>}
          {...props}
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
          id={name}
          value={value}
          data-tooltip-id={`${name}-tooltip`}
          className={`form-input ${tooltipErrors && errorMessage ? "border-error!" : ""}`}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          rows={6}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...props}
        />
      )}
      {tooltipErrors && errorMessage && touched && (
        <Tooltip id={`${name}-tooltip`}>{errorMessage}</Tooltip>
      )}
      {!tooltipErrors && errorMessage && touched && (
        <p className="absolute text-xs -bottom-5 right-1 text-error">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormInput;
