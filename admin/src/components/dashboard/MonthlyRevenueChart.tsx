"use client";

import * as React from "react";
import axios from "axios";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { API_URL } from "@/config/BackendUrl";

// Configuração visual do gráfico
const chartConfig = {
  revenue: {
    label: "Faturamento",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
};

export function MonthlyRevenueChart() {
  const [chartData, setChartData] = React.useState<{ date: string; revenue: number; fullDate: string }[]>([]);
  const [timeRange, setTimeRange] = React.useState("30");
  const [isLoading, setIsLoading] = React.useState(true);

  // Busca dados ao carregar ou mudar o filtro
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/metrics?days=${timeRange}`, {
          withCredentials: true,
        });

        const rawData = response.data as { _id: string; revenue: number }[];

        // Processamento dos dados para preencher dias vazios
        const processedData = fillMissingDates(rawData, parseInt(timeRange));
        setChartData(processedData);
      } catch (error) {
        console.error("Erro ao carregar gráfico:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Função para preencher dias que não tiveram vendas com 0 (para o gráfico não ficar "buraco")
  const fillMissingDates = (data: { _id: string; revenue: number }[], days: number) => {
    const result = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0]; // YYYY-MM-DD

      // Procura se tem venda nesse dia
      const found = data.find((item) => item._id === dateStr);

      result.push({
        fullDate: dateStr, // Para uso interno se precisar
        date: `${d.getDate()}/${d.getMonth() + 1}`, // Formato DD/MM para o eixo X
        revenue: found ? found.revenue / 100 : 0, // Converte centavos para reais
      });
    }
    return result;
  };

  const totalRevenue = React.useMemo(() => chartData.reduce((acc, curr) => acc + curr.revenue, 0), [chartData]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium">Receita</CardTitle>
          <CardDescription>Faturamento no período selecionado</CardDescription>
        </div>

        {/* Filtro de Período */}
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px] h-8" aria-label="Selecione o período">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-2xl font-bold text-primary min-w-[120px] text-right">
            {isLoading ? "..." : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalRevenue)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {isLoading ? (
          <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground animate-pulse">Carregando dados...</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} className="text-xs text-muted-foreground" />

              <YAxis tickLine={false} axisLine={false} tickFormatter={formatCurrency} className="text-xs text-muted-foreground" width={60} />

              <ChartTooltip
                cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                content={
                  <ChartTooltipContent
                    className="w-[180px] bg-white border shadow-lg rounded-lg"
                    nameKey="revenue"
                    formatter={(value) => (
                      <div className="flex items-center gap-2 w-full justify-between font-mono font-medium text-foreground">
                        <span>Faturamento</span>
                        <span className="text-primary">{formatCurrency(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />

              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
