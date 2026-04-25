type Props = {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
};

export default function FormInput({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  error
}: Props) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition ${
          error
            ? "border-rose-400 focus:border-rose-500"
            : "border-slate-300 focus:border-slate-500"
        }`}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
