import { Input } from "@/components/ui/input";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number | undefined | string;
  onChange: (value: number) => void;
}

export const MoneyInput = ({ value, onChange, className, ...props }: MoneyInputProps) => {
  // Formata o valor numérico para BRL (ex: 10.50 -> R$ 10,50)
  const formatCurrency = (val: number | string | undefined) => {
    if (val === undefined || val === "") return "";
    const numberVal = Number(val);
    if (isNaN(numberVal)) return "";

    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(numberVal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove tudo que não é dígito
    const rawValue = e.target.value.replace(/\D/g, "");

    // Converte para número e divide por 100 (lógica de ATM: 200 -> 2.00)
    const numberValue = Number(rawValue) / 100;

    onChange(numberValue);
  };

  return (
    <Input
      {...props}
      type="text" // Importante: type="text" previne o comportamento de scroll do mouse
      inputMode="numeric"
      className={className}
      value={formatCurrency(value)}
      onChange={handleChange}
      placeholder="R$ 0,00"
    />
  );
};
