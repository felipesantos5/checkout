// src/components/forms/OfferForm.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { API_URL } from "@/config/BackendUrl";

// --- Schema de Validação (Zod) ---
const optionalUrl = z.string().url({ message: "URL inválida." }).optional().or(z.literal(""));

const productSchema = z.object({
  _id: z.string().optional(), // _id pode existir em sub-documentos
  name: z.string().min(3, { message: "Nome do produto é obrigatório." }),
  description: z.string().optional(),
  imageUrl: optionalUrl,
  priceInCents: z.coerce.number().min(0.5, { message: "Preço deve ser ao menos R$ 0,50." }),
});

const colorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, { message: "Cor inválida" })
  .optional()
  .or(z.literal(""));

// O 'slug' não faz parte do formulário de criação/edição
const offerFormSchema = z.object({
  name: z.string().min(3, { message: "Nome do link é obrigatório." }),
  bannerImageUrl: optionalUrl,
  currency: z.string().default("BRL"),

  primaryColor: colorSchema,
  buttonColor: colorSchema,

  mainProduct: productSchema,
  orderBumps: z.array(productSchema).optional(),
});

// Exportamos o tipo para a página de edição usar
export type OfferFormData = z.infer<typeof offerFormSchema> & { _id?: string };

// Props do componente
interface OfferFormProps {
  onSuccess: () => void;
  initialData?: OfferFormData; // Dados para preencher (modo edição)
  offerId?: string; // ID da oferta (modo edição)
}

export function OfferForm({ onSuccess, initialData, offerId }: OfferFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!offerId; // Define se estamos em modo de edição

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    // 1. Usa 'initialData' se for fornecido (edição)
    //    ou os valores padrão (criação)
    defaultValues: initialData || {
      name: "",
      bannerImageUrl: "",
      currency: "BRL",
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

  // Função de Submissão
  async function onSubmit(values: OfferFormData) {
    setIsLoading(true);

    // Converte os preços (que estão em R$) para centavos
    const transformPrices = (data: OfferFormData) => {
      // Remove o _id dos sub-documentos, se houver
      const cleanSubDoc = (doc: any) => {
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

    const dataToSubmit = transformPrices(values);

    try {
      // 2. Lógica condicional: PUT (atualizar) ou POST (criar)
      if (isEditMode) {
        // --- Modo Edição ---
        await axios.put(`${API_URL}/offers/${offerId}`, dataToSubmit);
      } else {
        // --- Modo Criação ---
        await axios.post(`${API_URL}/offers`, dataToSubmit);
      }

      onSuccess(); // Chama o callback (redireciona e dispara o toast)
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

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moeda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
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
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mainProduct.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="O que o cliente está comprando..." {...field} />
                </FormControl>
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
                name={`orderBumps.${index}.priceInCents`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (Ex: 9.90)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
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
                priceInCents: 9.9,
                description: "",
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
