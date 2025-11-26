import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface TopCountry {
  name: string;
  value: number;
  count: number;
}

interface TopCountriesChartProps {
  data: TopCountry[];
}

const COLORS = ["#fbbf24", "#f59e0b", "#d97706", "#b45309", "#92400e"];

// Mapeamento de códigos de país para nomes em português
const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brasil",
  US: "Estados Unidos",
  PT: "Portugal",
  ES: "Espanha",
  FR: "França",
  IT: "Itália",
  DE: "Alemanha",
  GB: "Reino Unido",
  CA: "Canadá",
  MX: "México",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colômbia",
  PE: "Peru",
  UY: "Uruguai",
  PY: "Paraguai",
  BO: "Bolívia",
  VE: "Venezuela",
  EC: "Equador",
  // Adicione mais países conforme necessário
};

const getCountryName = (code: string): string => {
  return COUNTRY_NAMES[code] || code;
};

export function TopCountriesChart({ data }: TopCountriesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Países</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    );
  }

  // Traduzir nomes dos países
  const translatedData = data.map((item) => ({
    ...item,
    displayName: getCountryName(item.name),
  }));

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle className="text-lg">Países</CardTitle>
        <p className="text-xs text-muted-foreground">Vendas por país</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={translatedData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {translatedData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {translatedData.map((country, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-medium max-w-48 truncate">{country.displayName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-nowrap">
                <span className="text-muted-foreground">{country.count} vendas</span>
                <span className="font-bold">R$ {country.value.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
