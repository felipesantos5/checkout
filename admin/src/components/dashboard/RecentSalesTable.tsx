// src/components/dashboard/RecentSalesTable.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/config/BackendUrl";
import { Link } from "react-router-dom"; // Importe o Link
import { Button } from "../ui/button";

// Interface para os dados da Venda (com offerId populado)
interface Sale {
  _id: string;
  customerName: string;
  customerEmail: string;
  totalAmountInCents: number;
  status: "succeeded" | "pending" | "refunded";
  createdAt: string;
  // offerId agora é um objeto
  offerId: {
    _id: string;
    name: string;
  };
}

// Helper para formatar moeda
const formatCurrency = (amountInCents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amountInCents / 100);
};

// Helper para formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Este componente não precisa de props
export function RecentSalesTable() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      try {
        // Busca TODAS as vendas do usuário logado
        const response = await axios.get(`${API_URL}/sales`);

        if (Array.isArray(response.data)) {
          setSales(response.data);
        } else {
          setSales([]);
        }
      } catch (error) {
        toast.error("Falha ao carregar vendas recentes.", {
          description: (error as any).response?.data?.error?.message || (error as Error).message,
        });
        setSales([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSales();
  }, []);

  // Calcular vendas paginadas
  const totalPages = Math.ceil(sales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSales = sales.slice(startIndex, endIndex);

  // Funções de navegação
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Vendas Recentes</CardTitle>
        <CardDescription>Exibindo as últimas vendas de todas as suas ofertas.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Oferta</TableHead> {/* Nova Coluna */}
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhuma venda encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell>
                      <div className="font-medium">{sale.customerName || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">{sale.customerEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Button variant="link" asChild className="p-0 h-auto">
                        {sale.offerId ? (
                          <Link to={`/offers/${sale.offerId._id}`}>{sale.offerId.name}</Link>
                        ) : (
                          <span className="text-gray-400">Oferta Excluída</span>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{formatDate(sale.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={sale.status === "succeeded" ? "default" : sale.status === "refunded" ? "destructive" : "secondary"}
                        className={sale.status === "succeeded" ? "bg-green-600 text-white" : ""}
                      >
                        {sale.status === "succeeded" ? "Aprovada" : sale.status === "refunded" ? "Cancelada" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(sale.totalAmountInCents)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        {sales.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, sales.length)} de {sales.length} vendas
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <div className="text-sm font-medium">
                Página {currentPage} de {totalPages}
              </div>
              <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
