// src/pages/dashboard/OfferCreatePage.tsx
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OfferForm } from "@/components/forms/OfferForm";
import { toast } from "sonner";

export function OfferCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4  overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Criar Novo Link de Checkout</h1>
      </div>
      <Card className="w-full overflow-x-hidden">
        {/* <CardHeader>
          <CardTitle>Criar Novo Link de Checkout</CardTitle>
          <CardDescription>Preencha todos os campos para criar sua nova oferta.</CardDescription>
        </CardHeader> */}
        <CardContent className="w-full overflow-x-hidden">
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
