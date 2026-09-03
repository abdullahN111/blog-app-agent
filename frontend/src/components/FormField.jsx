"use client";

const baseClasses =
  "w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-middle/30 focus:border-middle transition-colors";

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
        className="block text-sm font-medium text-primary mb-2"
      >
        {label} {required && "*"}
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
          className={`${baseClasses} resize-none`}
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
