// src/components/forms/LoginForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // <-- Nosso Hook de Auth!

// 1. Schema de validação
const formSchema = z.object({
  email: z.string().email({ message: "E-mail inválido." }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
});

export function LoginForm() {
  const { login } = useAuth(); // <-- Pega a função 'login' do contexto
  const [isLoading, setIsLoading] = useState(false);

  // 2. Configuração do Form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  // 3. Função de Submissão
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // 4. Chama a função de login do Contexto
      await login(values.email, values.password);

      toast("Sucesso!", {
        description: "Login realizado. Redirecionando...",
      });
      // A navegação é tratada dentro do 'login()'
    } catch (error: any) {
      setIsLoading(false);
      toast("Erro no Login", {
        description: error.response?.data?.error?.message || "Credenciais inválidas.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="seu@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Carregando..." : "Entrar"}
        </Button>
      </form>
    </Form>
  );
}
