import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link2, Image as ImageIcon } from "lucide-react";
import type { OfferFormData } from "../forms/OfferForm";

const formatCurrency = (amount: number, currency: string = "BRL") => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

interface CheckoutOfferSummaryProps {
  offer: OfferFormData;
  slug?: string;
}

export function CheckoutOfferSummary({ offer, slug }: CheckoutOfferSummaryProps) {
  // 1. Prepara a lista unificada de produtos (Principal + Bumps + Upsell)
  const allProducts = [
    { ...(offer.mainProduct as any), type: "Principal" },
    ...(offer.orderBumps || []).map((bump) => ({ ...(bump as any), type: "Order Bump" })),
  ];

  // 2. Adiciona o Upsell à lista se estiver habilitado
  if (offer.upsell?.enabled) {
    allProducts.push({
      name: offer.upsell.name || "Upsell",
      // Mapeamos 'price' (do schema do Upsell) para 'priceInCents' (usado na tabela)
      priceInCents: offer.upsell.price || 0,
      description: "Oferta de Upsell (1-Click)", // Descrição padrão pois Upsell não tem esse campo no form
      imageUrl: null, // Upsell não tem imagem no schema atual
      type: "Upsell",
    } as any);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{offer.name}</CardTitle>
        {slug && (
          <CardDescription className="flex items-center gap-2 pt-1">
            <Link2 className="h-4 w-4" />
            <span className="font-mono">/{slug}</span>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 1. Informações Gerais */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Configurações Gerais</h3>
          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Moeda</span>
                <Badge variant="outline">{offer.currency}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Tabela de Produtos (Principal + Bumps + Upsell) */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Produtos e Preços</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProducts.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Badge
                        variant={product.type === "Principal" ? "default" : "secondary"}
                        className={product.type === "Upsell" ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200" : ""}
                      >
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-md">
                          <AvatarImage src={product.imageUrl} alt={product.name} />
                          <AvatarFallback className="rounded-md">
                            <ImageIcon />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[350px]">{product.description || "Sem descrição"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(product.priceInCents, offer.currency)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
