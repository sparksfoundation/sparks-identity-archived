import { clsxm } from "@libraries/clsxm";
import { UseFormRegisterReturn } from "react-hook-form";

const Label = ({ label, id }: { label?: string; id?: string }) => (
  <label
    htmlFor={id}
    className={clsxm(
      "mb-2 text-sm font-medium text-slate-700 dark:text-slate-200",
      label ? "block" : "hidden"
    )}
  >
    {label}
  </label>
)

const Error = ({ error }: { error?: string }) => (
  <span
    className={clsxm(
      "text-red-500 text-xs block mt-2",
      error ? "block" : "hidden"
    )}
  >
    {error}
  </span>
)

type InputPropType = {
  id?: string;
  className?: string;
  error?: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'hidden';
  registration: Partial<UseFormRegisterReturn>;
}

export const Input = (props: InputPropType) => {
  const { id, className = '', error, label, placeholder = '', type = 'text', registration } = props;
  return (
    <div>
      <Label label={label} id={id} />
      <input
        type={type}
        placeholder={placeholder}
        className={clsxm(
          "block w-full rounded-md border-0 py-1.5 text-slate-700 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
          className
        )}
        {...registration}
      />
      <Error error={error} />
    </div>
  )
};