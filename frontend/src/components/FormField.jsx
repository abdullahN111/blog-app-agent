"use client";

const baseClasses =
  "w-full px-4 py-3 bg-[#FAF8F5] border border-[#111110] text-sm text-[#111110] placeholder:text-[#85817A] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#C83E2B] transition-colors";

export default function FormField({
  type = "text",
  id,
  name,
  label,
  value,
  onChange,
  required = false,
  placeholder,
  rows,
  options,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-mono-meta uppercase tracking-[0.12em] text-[#111110] font-medium mb-2"
      >
        {label} {required && <span className="text-[#C83E2B]">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={rows || 4}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`${baseClasses} resize-none leading-relaxed`}
        />
      ) : type === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={baseClasses}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
}
