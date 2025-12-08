// src/services/auth.service.ts
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";
import { CreateUserPayload, LoginPayload } from "../types/auth.types";
import stripe from "../lib/stripe"; // 1. Importe sua instância centralizada do Stripe

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET não está definida no .env");
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Registra um novo usuário (vendedor)
 */
export const registerUser = async (payload: CreateUserPayload): Promise<IUser> => {
  // 1. Verifica se o usuário já existe
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new Error("Este e-mail já está em uso.");
  }

  // --- MUDANÇA PRINCIPAL AQUI ---
  // 2. Crie a conta conectada 'standard' no Stripe
  let stripeAccountId: string | undefined;
  try {
    const account = await stripe.accounts.create({
      type: "standard", // <-- ESTA É A MUDANÇA!
      email: payload.email,
      // (O Stripe cuidará de coletar todos os outros dados)
    });
    stripeAccountId = account.id;
  } catch (stripeError) {
    console.error("Falha ao criar conta Stripe Connect Standard:", stripeError);
    throw new Error("Falha ao configurar a conta de pagamento com o Stripe.");
  }
  // --- FIM DA MUDANÇA ---

  // 3. Cria o usuário no seu DB
  const user = new User({
    name: payload.name,
    email: payload.email,
    passwordHash: payload.password,
    stripeAccountId: stripeAccountId, // 4. Salva o ID da conta (acct_...)
    stripeOnboardingComplete: false, // 5. Começa como 'falso'
  });

  await user.save();
  return user;
};

/**
 * Loga um usuário e retorna um token JWT
 */
export const loginUser = async (payload: LoginPayload): Promise<string> => {
  // (Esta função não precisa de alterações)
  const user = await User.findOne({ email: payload.email }).select("+passwordHash");
  if (!user) {
    throw new Error("Credenciais inválidas.");
  }

  const isMatch = await user.comparePassword(payload.password);
  if (!isMatch) {
    throw new Error("Credenciais inválidas.");
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "30d" }); // 30 dias de sessão

  return token;
};
