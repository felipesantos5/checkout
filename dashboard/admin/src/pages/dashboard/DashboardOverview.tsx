// src/pages/dashboard/DashboardOverview.tsx
import { useAuth } from "@/context/AuthContext";
import { ConnectStripeCard } from "@/components/ConnectStripeCard"; // 1. Importe

export function DashboardOverview() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      {/* 2. Adicione o card de CTA do Stripe */}
      {/* Ele só vai aparecer se o onboarding não estiver completo */}
      <ConnectStripeCard />

      <h1 className="text-3xl font-bold">Bem-vindo, {user?.name || "Usuário"}!</h1>

      {/* O resto do seu dashboard (gráficos, estatísticas) iria aqui */}
      <p>Em construção: Aqui você verá seus gráficos de vendas.</p>
    </div>
  );
}
