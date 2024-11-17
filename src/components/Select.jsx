import React, { useState } from "react";

const Select = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const labelStyle =
    value || isFocused || true
      ? "absolute top-[-25%] bg-white px-2 left-2 text-gray-500 text-sm transition-all rounded-full"
      : "absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-500 transition-all cursor-pointer";

  return (
    <div className="relative">
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(value !== "")}
        className="rounded-xl p-2 border-2 w-full transition hover:scale-105 focus:scale-105 outline-none"
        required={required}
      >
        <option value="" disabled>
          Выберите тип продажи
        </option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={name} className={labelStyle}>
        {label}
      </label>
    </div>
  );
};

export default Select;
