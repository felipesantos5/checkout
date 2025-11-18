// src/components/forms/OfferForm.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { API_URL } from "@/config/BackendUrl";

// --- Schema de Validação (Zod) ---
const optionalUrl = z.string().url({ message: "URL inválida." }).optional().or(z.literal(""));

// Schema do Produto (com coerce para o preço do formulário)
const productSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(3, { message: "Nome do produto é obrigatório." }),
  headline: z.string().optional(),
  description: z.string().optional(),
  imageUrl: optionalUrl,
  priceInCents: z.coerce.number().min(0.5, { message: "Preço deve ser ao menos R$ 0,50." }),
  compareAtPriceInCents: z.coerce.number().optional(),
});

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { message: "Cor inválida" })
  .optional()
  .or(z.literal(""));

const offerFormSchema = z.object({
  name: z.string().min(3, { message: "Nome do link é obrigatório." }),
  bannerImageUrl: optionalUrl,
  currency: z.string().default("BRL"), // Input: string | undefined, Output: string
  language: z.string().default("pt"), // Idioma da oferta (pt, en, fr)
  collectAddress: z.boolean().default(false), // Se deve coletar endereço
  primaryColor: colorSchema,
  buttonColor: colorSchema,
  mainProduct: productSchema,
  utmfyWebhookUrl: optionalUrl,
  upsellLink: optionalUrl,
  orderBumps: z.array(productSchema).optional(),
});

// --- INÍCIO DA CORREÇÃO ---

// 1. Definir e EXPORTAR os tipos de Input e Output
export type OfferFormInput = z.input<typeof offerFormSchema>;
export type OfferFormOutput = z.infer<typeof offerFormSchema>;

// 2. O tipo de dados do formulário (FormData) DEVE ser o INPUT
//    Ele será usado pelo useForm e pela página de Edição (initialData)
export type OfferFormData = OfferFormInput & { _id?: string };

// --- FIM DA CORREÇÃO ---

// Props do componente
interface OfferFormProps {
  onSuccess: () => void;
  initialData?: OfferFormData; // initialData agora é do tipo Input
  offerId?: string;
}

export function OfferForm({ onSuccess, initialData, offerId }: OfferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!offerId;

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: initialData || {
      name: "",
      bannerImageUrl: "",
      currency: "BRL",
      language: "pt",
      collectAddress: false,
      utmfyWebhookUrl: "",
      upsellLink: "",
      mainProduct: {
        name: "",
        description: "",
        imageUrl: "",
        priceInCents: 0,
      },
      primaryColor: "#374151",
      buttonColor: "#2563EB",
      orderBumps: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "orderBumps",
  });

  // 4. Tipar a submissão com o tipo Output (dados validados)
  async function onSubmit(values: OfferFormData) {
    setIsLoading(true);

    // Esta função interna ainda espera o tipo Output (correto)
    const transformPrices = (data: OfferFormOutput) => {
      // O 'doc' aqui terá 'priceInCents' como 'number'
      const cleanSubDoc = (doc: { priceInCents: number; _id?: string; [key: string]: any }) => {
        const { _id, ...rest } = doc;
        return {
          ...rest,
          priceInCents: Math.round(doc.priceInCents * 100),
        };
      };

      return {
        ...data,
        mainProduct: cleanSubDoc(data.mainProduct),
        orderBumps: data.orderBumps?.map(cleanSubDoc),
      };
    };

    // 2. FAÇA O CAST aqui.
    // Nós sabemos que 'values' (que o TS acha que é Input)
    // é, na verdade, o Output, pois o Zod já validou.
    const dataToSubmit = transformPrices(values as OfferFormOutput);

    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/offers/${offerId}`, dataToSubmit);
      } else {
        await axios.post(`${API_URL}/offers`, dataToSubmit);
      }
      onSuccess();
    } catch (error) {
      toast.error(isEditMode ? "Falha ao atualizar link." : "Falha ao criar link.", {
        description: (error as any).response?.data?.error?.message || (error as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const ColorInput = ({ field }: { field: any }) => (
    <div className="flex items-center gap-2">
      <FormControl>
        <Input type="color" className="w-10 h-10 p-1 cursor-pointer" {...field} />
      </FormControl>
      <FormControl>
        <Input type="text" placeholder="#2563EB" className="font-mono w-32" {...field} />
      </FormControl>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* --- DADOS GERAIS --- */}
        <div className="space-y-4 rounded-md border p-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Link</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Lançamento Produto X" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bannerImageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Banner (Opcional)</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between gap-10">
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Moeda</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BRL">BRL (Real Brasileiro)</SelectItem>
                      <SelectItem value="USD">USD (Dólar Americano)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Idioma</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o idioma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pt">🇧🇷 Português</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="fr">🇫🇷 Français</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="collectAddress"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Coletar endereço de entrega</FormLabel>
                  <FormDescription>Ative esta opção se deseja coletar o endereço completo do cliente no checkout</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Separator />
          <h4 className="text-md font-medium">Personalização</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="primaryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor Principal (Textos, Bordas)</FormLabel>
                  <ColorInput field={field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Botão de Compra</FormLabel>
                  <ColorInput field={field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />
          <h4 className="text-md font-medium">Configurações de marketing</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="utmfyWebhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL do Webhook UTMfy (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://webhook.utmfy.com/..." {...field} />
                  </FormControl>
                  <FormDescription>Link (POST) para enviar dados de conversão à UTMfy.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="upsellLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link de Upsell (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://meu-site.com/pagina-de-upsell" {...field} />
                  </FormControl>
                  <FormDescription>Cliente será redirecionado para esta URL após a compra.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* --- PRODUTO PRINCIPAL --- */}
        <div className="space-y-4 rounded-md border p-4">
          <h3 className="text-lg font-medium">Produto Principal</h3>
          <FormField
            control={form.control}
            name="mainProduct.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Curso Completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mainProduct.priceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço (Ex: 19.90)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={typeof field.value === "number" ? field.value : String(field.value ?? "")} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainProduct.compareAtPriceInCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Comparação (em centavos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 9900 (para R$ 99,00)"
                    {...field}
                    value={typeof field.value === "number" ? field.value : String(field.value ?? "")}
                  />
                </FormControl>
                <FormDescription>Opcional: O preço "antigo" (Ex: De R$ 99,00).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainProduct.imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem do Produto (Opcional)</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- ORDER BUMPS --- */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Order Bumps</h3>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-4 rounded-md border p-4 relative">
              <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <h4 className="font-medium">Order Bump {index + 1}</h4>

              <FormField
                control={form.control}
                name={`orderBumps.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Bump</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Ebook Bônus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`orderBumps.${index}.headline`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Sim! Quero turbinar minha compra!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`orderBumps.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Aprenda técnicas avançadas com este material exclusivo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`orderBumps.${index}.priceInCents`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (Ex: 9.90)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={typeof field.value === "number" ? field.value : String(field.value ?? "")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`orderBumps.${index}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem do Bump (Opcional)</FormLabel>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({
                name: "",
                headline: "",
                description: "",
                priceInCents: 9.9, // Este 'number' é assignável a 'unknown'
                imageUrl: "",
              })
            }
          >
            Adicionar Order Bump
          </Button>
        </div>

        <Separator />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Salvando..." : isEditMode ? "Atualizar Link" : "Salvar Link de Checkout"}
        </Button>
      </form>
    </Form>
  );
}
