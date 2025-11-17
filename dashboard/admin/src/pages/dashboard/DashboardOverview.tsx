// src/pages/dashboard/DashboardOverview.tsx
import { useEffect, useState } from "react"; // 1. Importe useEffect e useState
import axios from "axios"; // 2. Importe axios
import { useAuth } from "@/context/AuthContext";
import { ConnectStripeCard } from "@/components/ConnectStripeCard";
import { API_URL } from "@/config/BackendUrl"; // 3. Importe a URL da API
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // 4. Importe os Cards
import { Loader2 } from "lucide-react"; // 5. Importe o Loader
import { RecentSalesTable } from "@/components/dashboard/RecentSalesTable";

// --- NOVO: Helper para formatar moeda ---
const formatCurrency = (amountInCents: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(amountInCents / 100);
};

// --- NOVO: Tipagem para o Saldo ---
interface StripeBalance {
  amount: number;
  currency: string;
}

export function DashboardOverview() {
  const { user } = useAuth();

  // --- NOVOS ESTADOS ---
  const [availableBalance, setAvailableBalance] = useState<StripeBalance | null>(null);
  const [pendingBalance, setPendingBalance] = useState<StripeBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  // --- NOVO: Efeito para buscar o saldo ---
  useEffect(() => {
    // Só busca o saldo se o usuário já completou o onboarding
    if (user?.stripeOnboardingComplete) {
      const fetchBalance = async () => {
        try {
          setIsLoadingBalance(true);
          const response = await axios.get(`${API_URL}/stripe/balance`);

          // O Stripe retorna 'available' e 'pending' como arrays de moedas.
          // Vamos pegar o primeiro item de cada (geralmente BRL).
          setAvailableBalance(response.data.available[0] || null);
          setPendingBalance(response.data.pending[0] || null);
        } catch (error) {
          console.error("Erro ao buscar saldo:", error);
          // Não precisa de toast aqui, podemos só não mostrar o card
        } finally {
          setIsLoadingBalance(false);
        }
      };

      fetchBalance();
    } else {
      setIsLoadingBalance(false); // Não precisa carregar se não há onboarding
    }
  }, [user]); // Roda quando o usuário é carregado

  return (
    <div className="flex flex-col gap-6">
      <ConnectStripeCard />

      <h1 className="text-3xl font-bold">Bem-vindo, {user?.name || "Usuário"}!</h1>

      {/* --- NOVO: Grid de Cards de Saldo --- */}
      {!user?.stripeOnboardingComplete && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Card Saldo Disponível */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
              <span className="text-green-500">$</span>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : availableBalance ? (
                <div className="text-2xl font-bold">{formatCurrency(availableBalance.amount, availableBalance.currency)}</div>
              ) : (
                <div className="text-2xl font-bold">R$ 0,00</div>
              )}
              <p className="text-xs text-muted-foreground">Total disponível para saque.</p>
            </CardContent>
          </Card>

          {/* Card Saldo Pendente */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendente</CardTitle>
              <span className="text-muted-foreground">...</span>
            </CardHeader>
            <CardContent>
              {isLoadingBalance ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : pendingBalance ? (
                <div className="text-2xl font-bold">{formatCurrency(pendingBalance.amount, pendingBalance.currency)}</div>
              ) : (
                <div className="text-2xl font-bold">R$ 0,00</div>
              )}
              <p className="text-xs text-muted-foreground">Valor processando e que ficará disponível em breve.</p>
            </CardContent>
          </Card>
        </div>
      )}
      {!user?.stripeOnboardingComplete && <RecentSalesTable />}
    </div>
  );
}
