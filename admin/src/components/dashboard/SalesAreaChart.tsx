import { Bar, BarChart, XAxis, YAxis, LabelList } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

interface SalesChartProps {
  chartData: { date: string; value: number }[];
}

// Configuração de cores e labels
const chartConfig = {
  value: {
    label: "Receita",
    color: "#EAB308", // Seu Amarelo/Dourado
  },
} satisfies ChartConfig;

export function SalesAreaChart({ chartData }: SalesChartProps) {
  // Formata valor para o tooltip (BRL)
  const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Formatador inteligente de data
  const formatDateLabel = (value: string) => {
    // Se for formato de hora (HH:MM), retorna direto
    if (value.includes(":")) {
      return value;
    }

    // Se for formato YYYY-MM-DD, converte para DD/MM
    if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [, month, day] = value.split("-");
      return `${day}/${month}`;
    }

    // Caso contrário, retorna como está
    return value;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Histórico de Vendas</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Receita no período selecionado</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3 sm:pb-4">
        <ChartContainer config={chartConfig} className="h-full min-h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
              right: 100,
              top: 10,
              bottom: 10,
            }}
          >
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              dataKey="date"
              type="category"
              tickLine={false}
              tickMargin={5}
              axisLine={false}
              width={45}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              tickFormatter={formatDateLabel}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={5} barSize={32}>
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={10}
                fontWeight={600}
                content={(props: any) => {
                  const { x, y, width, height, value } = props;
                  if (!value || value === 0) return null;
                  return (
                    <text
                      x={x + width + 8}
                      y={y + height / 2}
                      fill="currentColor"
                      fontSize={10}
                      fontWeight={600}
                      textAnchor="start"
                      dominantBaseline="middle"
                    >
                      {formatCurrency(value)}
                    </text>
                  );
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
