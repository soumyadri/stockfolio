import type { InputHTMLAttributes } from "react";
import { Input } from "./Input";

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function NumberInput({ label, min = 1, ...props }: NumberInputProps) {
  return <Input type="number" variant="default" label={label} min={min} {...props} />;
}
