// src/pages/dashboard/ABTestCreatePage.tsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config/BackendUrl";
import { FlaskConical, Loader2, Plus, Trash2, Percent, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface Offer {
  _id: string;
  name: string;
  slug: string;
  mainProduct: {
    name: string;
    priceInCents: number;
  };
}

interface SelectedOffer {
  offerId: string;
  percentage: number;
}

// Cores das variantes usando as variáveis CSS do Tailwind
const VARIANT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function ABTestCreatePage() {
  const [name, setName] = useState("");
  const [selectedOffers, setSelectedOffers] = useState<SelectedOffer[]>([
    { offerId: "", percentage: 50 },
    { offerId: "", percentage: 50 },
  ]);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingOffers, setIsFetchingOffers] = useState(true);

  const navigate = useNavigate();

  // Fetch available offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(`${API_URL}/offers`);
        setAvailableOffers(response.data);
      } catch (error) {
        toast.error("Falha ao carregar ofertas.", {
          description: (error as Error).message,
        });
      } finally {
        setIsFetchingOffers(false);
      }
    };
    fetchOffers();
  }, []);

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return selectedOffers.reduce((sum, o) => sum + (o.percentage || 0), 0);
  }, [selectedOffers]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    const hasName = name.trim().length > 0;
    const hasMinOffers = selectedOffers.length >= 2;
    const allOffersSelected = selectedOffers.every((o) => o.offerId !== "");
    const percentagesValid = Math.abs(totalPercentage - 100) < 0.01;
    const noDuplicates = new Set(selectedOffers.map((o) => o.offerId)).size === selectedOffers.length;

    return hasName && hasMinOffers && allOffersSelected && percentagesValid && noDuplicates;
  }, [name, selectedOffers, totalPercentage]);

  // Função auxiliar para distribuir porcentagens igualmente
  const distributeEqually = (offers: SelectedOffer[]): SelectedOffer[] => {
    const count = offers.length;
    const equalPercentage = Math.floor(100 / count);
    const remainder = 100 - equalPercentage * count;

    return offers.map((offer, index) => ({
      ...offer,
      percentage: equalPercentage + (index < remainder ? 1 : 0),
    }));
  };

  const handleAddOffer = () => {
    const newOffers = [...selectedOffers, { offerId: "", percentage: 0 }];
    setSelectedOffers(distributeEqually(newOffers));
  };

  const handleRemoveOffer = (index: number) => {
    if (selectedOffers.length <= 2) {
      toast.error("O teste deve ter pelo menos 2 ofertas.");
      return;
    }
    const newOffers = selectedOffers.filter((_, i) => i !== index);
    setSelectedOffers(distributeEqually(newOffers));
  };

  const handleOfferChange = (index: number, offerId: string) => {
    const newOffers = [...selectedOffers];
    newOffers[index].offerId = offerId;
    setSelectedOffers(newOffers);
  };

  const handlePercentageChange = (index: number, percentage: number) => {
    const newOffers = [...selectedOffers];
    newOffers[index].percentage = Math.max(0, Math.min(100, percentage));
    setSelectedOffers(newOffers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Por favor, preencha todos os campos corretamente.");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/abtests`, {
        name,
        isActive: true, // Sempre cria como ativo
        offers: selectedOffers,
      });
      toast.success("Teste A/B criado com sucesso!");
      navigate("/abtests");
    } catch (error) {
      toast.error("Falha ao criar teste A/B.", {
        description: (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get offer name by id
  const getOfferName = (offerId: string) => {
    const offer = availableOffers.find((o) => o._id === offerId);
    return offer?.name || "";
  };

  return (
    <div className="max-w-4xl m-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6" />
          Criar Teste A/B
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Configure um novo teste para comparar ofertas diferentes.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            {/* Nome do Teste */}
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Teste</Label>
              <Input id="name" placeholder="Ex: Teste Cores do Checkout" value={name} onChange={(e) => setName(e.target.value)} />
              <p className="text-xs text-muted-foreground">Um nome descritivo para identificar este teste.</p>
            </div>

            <Separator />

            {/* Ofertas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Ofertas do Teste
                  </h3>
                  <p className="text-sm text-muted-foreground">Selecione as ofertas e defina as porcentagens.</p>
                </div>
                {selectedOffers.length > 0 && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {selectedOffers.length} Ofertas
                  </span>
                )}
              </div>

              {isFetchingOffers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableOffers.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                  <p className="mb-2">Você precisa criar ofertas antes de criar um teste A/B.</p>
                  <Button variant="outline" onClick={() => navigate("/offers/new")}>
                    Criar Oferta
                  </Button>
                </div>
              ) : (
                <>
                  {selectedOffers.map((selectedOffer, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-card relative space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: VARIANT_COLORS[index % VARIANT_COLORS.length] }}
                          >
                            {index + 1}
                          </div>
                          Variante {String.fromCharCode(65 + index)}
                        </h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                          onClick={() => handleRemoveOffer(index)}
                          disabled={selectedOffers.length <= 2}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Oferta</Label>
                          <Select value={selectedOffer.offerId} onValueChange={(value) => handleOfferChange(index, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma oferta" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableOffers
                                .filter(
                                  (offer) =>
                                    !selectedOffers.some((s) => s.offerId === offer._id) || selectedOffer.offerId === offer._id
                                )
                                .map((offer) => (
                                  <SelectItem key={offer._id} value={offer._id}>
                                    {offer.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Porcentagem</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={selectedOffer.percentage}
                              onChange={(e) => handlePercentageChange(index, parseInt(e.target.value) || 0)}
                              className="pr-8"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddOffer}
                    className="w-full border-dashed"
                    disabled={availableOffers.length <= selectedOffers.length}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Variante
                  </Button>

                  {/* Percentage Visualization */}
                  <div className="pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Distribuição Total</span>
                      <span className={`text-sm font-bold ${Math.abs(totalPercentage - 100) < 0.01 ? "text-green-600" : "text-destructive"}`}>
                        {totalPercentage}%
                      </span>
                    </div>

                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                      {selectedOffers.map((offer, index) => (
                        <div
                          key={index}
                          className="h-full transition-all"
                          style={{
                            width: `${offer.percentage}%`,
                            backgroundColor: VARIANT_COLORS[index % VARIANT_COLORS.length],
                          }}
                          title={`${getOfferName(offer.offerId) || `Variante ${String.fromCharCode(65 + index)}`}: ${offer.percentage}%`}
                        />
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {selectedOffers.map((offer, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: VARIANT_COLORS[index % VARIANT_COLORS.length] }} />
                          <span className="text-muted-foreground">
                            {getOfferName(offer.offerId) || `Variante ${String.fromCharCode(65 + index)}`}: {offer.percentage}%
                          </span>
                        </div>
                      ))}
                    </div>

                    {Math.abs(totalPercentage - 100) > 0.01 && (
                      <p className="text-xs text-destructive">A soma das porcentagens deve ser exatamente 100%.</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/abtests")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !isFormValid}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              "Criar Teste A/B"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ABTestCreatePage;
