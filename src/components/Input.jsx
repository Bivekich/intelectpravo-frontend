import React, { useState } from "react";

const Input = ({
  label,
  type,
  name,
  value,
  onChange,
  hidden = false,
  required = false,
  readOnly = false,
  accept = "", // Adding accept as a prop with a default value of an empty string
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const labelStyle =
    value || isFocused || type === "date" || type === "file"
      ? "absolute top-[-25%] bg-white px-2 left-2 text-gray-500 text-sm transition-all rounded-full"
      : "absolute top-1/2 left-2 transform -translate-y-1/2 text-gray-500 transition-all cursor-pointer";

  // Determine the border color based on the value
  const borderColor = value ? "border-green-500" : "border-gray-300";

  return (
    <div className="relative w-full" hidden={hidden}>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        readOnly={readOnly}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)} // Reset focus state on blur
        className={`rounded-xl p-2 bg-transparent border-2 w-full transition hover:scale-105 focus:scale-105 outline-none ${borderColor}`}
        required={required}
        accept={type === "file" ? accept : undefined} // Apply accept attribute only if it's a file input
      />

      <label htmlFor={name} className={labelStyle}>
        {label}
      </label>
    </div>
  );
};

export default Input;
