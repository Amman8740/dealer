// components/ui/Input.tsx
import React from "react";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="border rounded px-3 py-2 w-full" {...props} />;
}

// components/ui/Select.tsx
type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  onChange?: (value: string) => void;     // <- always string
};

export function Select({ onChange, ...props }: SelectProps) {
  return (
    <select
      {...props}
      onChange={(e) => onChange?.(e.currentTarget.value)}
      className={["border rounded px-3 py-2 w-full", props.className].filter(Boolean).join(" ")}
    />
  );
}

// components/ui/Button.tsx
export function Button({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className="px-3 py-2 rounded bg-black text-white disabled:opacity-50" {...rest}>{children}</button>;
}
