import { Bar, BarChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
      <CardHeader className="pb-4">
        <CardTitle>Histórico de Vendas</CardTitle>
        <CardDescription>Receita no período selecionado</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <ChartContainer config={chartConfig} className="h-full min-h-[400px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: 10,
              right: 20,
              top: 10,
              bottom: 10,
            }}
          >
            <XAxis type="number" dataKey="value" hide />
            <YAxis
              dataKey="date"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              width={60}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              tickFormatter={formatDateLabel}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel formatter={(value) => formatCurrency(Number(value))} />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={5} barSize={32} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
