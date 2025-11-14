// src/pages/dashboard/OfferEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OfferForm, type OfferFormData } from "@/components/forms/OfferForm";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// 1. Importe o novo componente de resumo
import { CheckoutOfferSummary } from "@/components/dashboard/CheckoutOfferSummary";
import { SalesHistoryTable } from "@/components/dashboard/SalesHistoryTable";

const API_URL = "http://localhost:4242/api";

// Tipagem completa da API (incluindo o slug)
type ApiOfferData = OfferFormData & {
  slug: string;
};

// Helper para converter centavos para reais (string)
const centsToReais = (cents: number): number => {
  return parseFloat((cents / 100).toFixed(2));
};

const transformDataForForm = (data: ApiOfferData): OfferFormData => {
  return {
    ...data,
    mainProduct: {
      ...data.mainProduct,
      priceInCents: centsToReais(data.mainProduct.priceInCents),
    },
    orderBumps: data.orderBumps.map((bump: any) => ({
      ...bump,
      priceInCents: centsToReais(bump.priceInCents),
    })),
  };
};

export function OfferEditPage() {
  const navigate = useNavigate();
  const { id: offerId } = useParams<{ id: string }>();

  // 2. Estado para os dados brutos (com slug) e dados de formulário
  const [offerData, setOfferData] = useState<ApiOfferData | null>(null);
  const [formData, setFormData] = useState<OfferFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!offerId) return;

    const fetchOffer = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/offers/${offerId}`);
        setOfferData(response.data); // Salva os dados brutos (com slug)
        setFormData(transformDataForForm(response.data)); // Salva os dados do formulário
      } catch (error) {
        toast.error("Falha ao carregar oferta.", {
          description: "Você pode não ter permissão ou a oferta não existe.",
        });
        navigate("/offers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOffer();
  }, [offerId, navigate]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Oferta...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Buscando dados da oferta...</p>
        </CardContent>
      </Card>
    );
  }

  // Não renderiza nada se os dados não carregarem
  if (!formData || !offerData) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 3. Renderize o Resumo no topo */}
      <CheckoutOfferSummary offer={formData} slug={offerData.slug} />

      <Separator />

      <SalesHistoryTable offerId={offerId!} />

      <Separator />

      {/* 4. Renderize o Formulário de Edição abaixo */}
      <Card>
        <CardHeader>
          <CardTitle>Editar Oferta</CardTitle>
          <CardDescription>Ajuste os campos abaixo para editar sua oferta.</CardDescription>
        </CardHeader>
        <CardContent>
          <OfferForm
            offerId={offerId}
            initialData={formData}
            onSuccess={() => {
              toast.success("Oferta atualizada com sucesso!");
              navigate("/offers"); // Volta para a lista
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
