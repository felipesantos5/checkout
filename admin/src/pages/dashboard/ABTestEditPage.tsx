// src/pages/dashboard/ABTestEditPage.tsx
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "@/config/BackendUrl";
import { FlaskConical, Loader2, Plus, Trash2, Percent, ChevronDown, Settings, Layers, Link as LinkIcon } from "lucide-react";
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

interface ABTest {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  offers: {
    offerId: { _id: string; name: string };
    percentage: number;
  }[];
}

// Cores das variantes usando as variáveis CSS do Tailwind
const VARIANT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// --- COMPONENTE DE SEÇÃO (ACCORDION) - Mesmo padrão do OfferForm ---
interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}

const FormSection = ({ title, icon, description, children, defaultOpen = false, badge }: FormSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="w-full overflow-hidden border shadow-sm">
      <div className="flex items-center justify-between p-4 cursor-pointer bg-card transition-colors" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-3">
          {icon && <div className="text-primary">{icon}</div>}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold leading-none">{title}</h3>
              {badge && <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary">{badge}</span>}
            </div>
            {description && <p className="text-sm text-muted-foreground hidden md:block">{description}</p>}
          </div>
        </div>
        <div className={`transition-transform duration-200 text-muted-foreground ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
          <Separator />
          <div className="p-5 space-y-6 bg-card/50">{children}</div>
        </div>
      )}
    </Card>
  );
};

export function ABTestEditPage() {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState(""); // Keep para exibição apenas
  const [isActive, setIsActive] = useState(true);
  const [selectedOffers, setSelectedOffers] = useState<SelectedOffer[]>([]);
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const navigate = useNavigate();

  // Fetch test and offers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testRes, offersRes] = await Promise.all([axios.get(`${API_URL}/abtests/${id}`), axios.get(`${API_URL}/offers`)]);

        const test: ABTest = testRes.data;
        setName(test.name);
        setSlug(test.slug);
        setIsActive(test.isActive);
        setSelectedOffers(
          test.offers.map((o) => ({
            offerId: o.offerId._id,
            percentage: o.percentage,
          }))
        );
        setAvailableOffers(offersRes.data);
      } catch (error) {
        toast.error("Falha ao carregar teste A/B.", {
          description: (error as Error).message,
        });
        navigate("/abtests");
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id, navigate]);

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
      await axios.put(`${API_URL}/abtests/${id}`, {
        name,
        isActive,
        offers: selectedOffers,
      });
      toast.success("Teste A/B atualizado com sucesso!");
      navigate("/abtests");
    } catch (error) {
      toast.error("Falha ao atualizar teste A/B.", {
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

  // Copy link to clipboard
  const handleCopyLink = () => {
    const checkoutBaseUrl = window.location.hostname === "localhost" ? "https://localhost:5173" : "https://pay.snappcheckout.com";
    const url = `${checkoutBaseUrl}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl m-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6" />
          Editar Teste A/B
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Altere as configurações do seu teste.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- 1. CONFIGURAÇÕES GERAIS --- */}
        <FormSection title="Configurações Gerais" icon={<Settings className="w-5 h-5" />} description="Nome e status do teste A/B." defaultOpen={true}>
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Teste</Label>
              <Input id="name" placeholder="Ex: Teste Cores do Checkout" value={name} onChange={(e) => setName(e.target.value)} />
              <p className="text-xs text-muted-foreground">Um nome descritivo para identificar este teste.</p>
            </div>

            <div className="space-y-2">
              <Label>Link do Teste</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 p-3 bg-muted rounded-md border">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">pay.snappcheckout.com/</span>
                  <span className="text-sm font-mono font-medium">{slug}</span>
                </div>
                <Button type="button" variant="outline" onClick={handleCopyLink} className="h-[46px]">
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-card">
              <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
              <div className="space-y-1 leading-none">
                <Label htmlFor="active">Teste Ativo</Label>
                <p className="text-sm text-muted-foreground">Quando ativo, o link irá randomizar entre as ofertas.</p>
              </div>
            </div>
          </div>
        </FormSection>

        {/* --- 2. OFERTAS DO TESTE --- */}
        <FormSection
          title="Ofertas do Teste"
          icon={<Layers className="w-5 h-5" />}
          description="Selecione as ofertas e defina as porcentagens de distribuição."
          defaultOpen={true}
          badge={selectedOffers.length > 0 ? `${selectedOffers.length} Ofertas` : undefined}
        >
          <div className="space-y-4">
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
                          .filter((o) => !selectedOffers.some((so, i) => so.offerId === o._id && i !== index))
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
                        min={0}
                        max={100}
                        value={selectedOffer.percentage}
                        onChange={(e) => handlePercentageChange(index, parseInt(e.target.value) || 0)}
                        className="pr-8"
                      />
                      <Percent className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Offer Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddOffer}
              disabled={selectedOffers.length >= availableOffers.length}
              className="w-full border-dashed"
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

              {Math.abs(totalPercentage - 100) > 0.01 && <p className="text-xs text-destructive">A soma das porcentagens deve ser exatamente 100%.</p>}
            </div>
          </div>
        </FormSection>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/abtests")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading || !isFormValid}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ABTestEditPage;
