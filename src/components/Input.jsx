import React, { useState } from "react";

const Input = ({
  label,
  type,
  name,
  value,
  onChange,
  hidden = false,
  required = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const labelStyle =
    value || isFocused || type == "date" || type == "file"
      ? "absolute top-[-25%] bg-white px-2 left-2 text-gray-500  text-sm transition-all rounded-full"
      : "absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-500 transition-all cursor-pointer";

  return (
    <div className="relative w-full" hidden={hidden}>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(type == "date")}
        className="rounded-xl p-2 bg-transparent border-2 w-full transition hover:scale-105 focus:scale-105 outline-none"
        required={required}
      />

      <label htmlFor={name} className={labelStyle}>
        {label}
      </label>
    </div>
  );
};

export default Input;
