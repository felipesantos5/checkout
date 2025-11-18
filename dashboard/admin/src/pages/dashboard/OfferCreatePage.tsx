// src/pages/dashboard/OfferCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OfferForm } from "@/components/forms/OfferForm";
import { toast } from "sonner";

export function OfferCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Link de Checkout</CardTitle>
          <CardDescription>Preencha todos os campos para criar sua nova oferta.</CardDescription>
        </CardHeader>
        <CardContent>
          <OfferForm
            onSuccess={() => {
              toast.success("Oferta criada com sucesso!");
              navigate("/offers"); // Volta para a lista
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
