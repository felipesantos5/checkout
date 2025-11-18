# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for a multi-vendor checkout/payment platform with three main applications:
- **api**: Express + TypeScript backend with MongoDB
- **admin**: React admin dashboard for vendors
- **checkout**: Public-facing checkout pages for customers

## Common Development Commands

### Backend (api/)
```bash
cd api
npm run dev          # Start development server with hot reload (ts-node-dev)
npm run build        # Compile TypeScript to dist/
npm start            # Run production build (node dist/server.js)
```

### Admin Frontend (admin/)
```bash
cd admin
npm run dev          # Start Vite dev server
npm run build        # TypeScript check + Vite production build
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

### Checkout Frontend (checkout/)
```bash
cd checkout
npm run dev          # Start Vite dev server with HTTPS (for Stripe)
npm run build        # TypeScript check + Vite production build
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

## Architecture

### Backend (api/)

**Tech Stack**: Express 5 + TypeScript + MongoDB (Mongoose) + Stripe + Cloudinary

**Key Integrations**:
- **Stripe Connect**: Each vendor gets a Stripe Standard connected account created automatically on registration
- **Stripe Payments**: Payment processing with 5% application fee (configurable in `api/src/controllers/payment.controller.ts`)
- **Cloudinary**: Image uploads for product/banner images

**Authentication**: JWT tokens (7-day expiry) with Bearer token in Authorization header. Middleware adds `req.userId` to protected routes.

**Database Models** (`api/src/models/`):
1. **User**: Vendors with `stripeAccountId` and `stripeOnboardingComplete`
2. **Offer**: Checkout pages with embedded products (not separate collection):
   - `mainProduct`: Single product object
   - `orderBumps`: Array of upsell products
   - Auto-generated 16-char slug for public URLs
3. **Sale**: Transaction records created by Stripe webhooks
4. **Product**: Legacy standalone products (mostly superseded by embedded products in Offer)

**Important Pattern**: Products are embedded in Offers, not referenced. This simplifies pricing consistency.

**Routes Structure** (`api/src/routes/index.ts`):
All routes prefixed with `/api/`:
- `/auth` - Register, login, get current user
- `/offers` - CRUD + public slug lookup (`/slug/:slug` is public)
- `/payments` - Create payment intents (public endpoint)
- `/stripe` - Account onboarding links, balance (protected)
- `/sales` - List sales by owner/offer (protected)
- `/upload` - Cloudinary image uploads (protected)
- `/products` - CRUD (protected, legacy)

**Webhooks** (`api/src/webhooks/stripe/`):
- Route: `POST /api/webhooks/stripe` (uses `express.raw()` for signature verification)
- Events handled:
  - `payment_intent.succeeded`: Creates Sale record
  - `charge.refunded`: Updates Sale status to "refunded"

**Payment Flow**:
1. Checkout frontend calls `POST /api/payments` with offer slug, selected bumps, quantity, customer info
2. Backend creates PaymentIntent "on behalf of" vendor's connected Stripe account
3. Returns `clientSecret` to frontend
4. Frontend confirms payment with Stripe Elements
5. Webhook creates Sale record when payment succeeds

**Environment Variables Required**:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for signing JWT tokens
- `STRIPE_SECRET_KEY`: Platform Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: For webhook signature verification
- `STRIPE_CLIENT_ID`: For Stripe Connect
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Image uploads
- `PORT`: Server port (default 4242)
- `NODE_ENV`: development/production

### Admin Frontend (admin/)

**Tech Stack**: React 19 + Vite + TypeScript + Radix UI + Tailwind CSS 4

**State Management**: Context API (no Redux/Zustand)
- `AuthContext`: User data, JWT token, login/logout functions
  - Token stored in httpOnly cookie "auth_token" via nookies
  - Auto-logout on 401 responses

**Routes** (`admin/src/App.tsx`):
```
/login              # LoginPage
/register           # RegisterPage
/                   # DashboardLayout (protected)
  ├── /             # DashboardOverview
  ├── /offers       # OffersPage (list all offers)
  ├── /offers/new   # OfferCreatePage
  ├── /offers/:id   # OfferEditPage
  ├── /dashboard/stripe-return   # Stripe onboarding callback
  └── /dashboard/stripe-refresh  # Stripe onboarding interrupted
```

**Path Alias**: `@` maps to `./src` (configured in vite.config.ts and tsconfig.json)

**Key Features**:
- Offer creation/editing with image upload (Cloudinary)
- Stripe Connect onboarding flow
- Sales history and balance tracking
- React Hook Form + Zod for form validation

**API Communication**:
- Base URL from `VITE_BACKEND_URL` environment variable
- Axios configured globally with Bearer token from AuthContext
- Error handling with toast notifications (sonner)

**Environment Variables Required**:
- `VITE_BACKEND_URL`: Backend API URL (e.g., http://localhost:4242)

### Checkout Frontend (checkout/)

**Tech Stack**: React 19 + Vite + TypeScript + Stripe Elements + Tailwind CSS 4

**Routing**: Single route pattern - `/c/:slug` loads offer by slug

**Context Providers**:
- `ThemeContext`: Primary/button colors from offer config with contrast calculation
- `I18nContext`: Multi-language support (pt, en, fr) based on offer language

**Payment Integration**:
- Stripe Elements for credit card input (PCI compliant)
- Supports: Credit cards, Apple Pay, Google Pay, PIX (Brazil)
- UTM tracking: Parses URL query params and sends to backend

**Checkout Flow**:
1. Load offer data from `GET /api/offers/slug/{slug}` (public endpoint)
2. Apply theme colors and language from offer config
3. Customer selects quantity, order bumps, enters contact info
4. Call `POST /api/payments` to create PaymentIntent
5. Confirm payment with Stripe Elements or redirect for PIX
6. Redirect to `upsellLink` if configured, otherwise show success message

**Internationalization** (`checkout/src/i18n/translations/`):
- Separate translation files for pt, en, fr
- Language determined by offer configuration, not browser locale
- Type-safe translations with TypeScript

**Development**: Uses `@vitejs/plugin-basic-ssl` for HTTPS in dev mode (required for Apple Pay testing)

**Environment Variables Required**:
- `VITE_BACKEND_URL`: Backend API URL
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key

## Key Architectural Decisions

1. **Embedded Products in Offers**: Products are stored as subdocuments in Offer model, not as separate collections. When working with products, always modify them within the Offer document.

2. **Stripe Standard Accounts**: Each vendor gets a Stripe Standard connected account (not Express or Custom). Stripe handles the onboarding UI and compliance.

3. **Application Fees**: Platform takes 5% of each transaction. This is configured in `api/src/controllers/payment.controller.ts` when creating the PaymentIntent.

4. **Webhook-Driven Sales**: Sale records are created only when Stripe confirms payment via webhook. Never create Sale records directly from payment controller.

5. **Auto-Generated Slugs**: Offer slugs are 16-character IDs generated with nanoid. Public checkout URL: `{checkout-domain}/c/{slug}`

6. **JWT in Cookies**: Admin frontend stores JWT in httpOnly cookie for automatic inclusion in requests and better security.

7. **Public vs Protected Routes**:
   - Public: `GET /api/offers/slug/:slug`, `POST /api/payments`, webhook endpoint
   - Protected: All other API endpoints require JWT

8. **Image Storage**: All images stored in Cloudinary, not MongoDB. URLs saved in database.

## Code Patterns

### Adding a New Protected API Endpoint

```typescript
// 1. Create controller (api/src/controllers/)
export const handleNewFeature = async (req: Request, res: Response) => {
  const userId = req.userId; // Available from auth middleware
  // ... implementation
};

// 2. Add route (api/src/routes/)
import { protectRoute } from '../middleware/auth.middleware';
router.post('/new-feature', protectRoute, handleNewFeature);

// 3. Register in index.ts
app.use('/api/feature', featureRoutes);
```

### Creating a Sale Record (Webhook Only)

Sale records should ONLY be created in webhook handlers, never directly:
```typescript
// ✅ Correct - in webhook handler
const sale = await Sale.create({
  ownerId,
  offerId,
  stripePaymentIntentId: paymentIntent.id,
  // ...
});

// ❌ Wrong - in payment controller
// Never create Sale here, webhook will handle it
```

### Working with Embedded Products

Products are embedded in Offers. To add/update products:
```typescript
// ✅ Correct
const offer = await Offer.findById(offerId);
offer.mainProduct = { name, description, price, image };
offer.orderBumps.push({ name, description, price, image });
await offer.save();

// ❌ Wrong - don't create separate Product documents for offers
const product = await Product.create({ ... });
```

### Form Validation (Admin Frontend)

Use React Hook Form + Zod:
```typescript
const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

## Testing Payment Flows

1. Use Stripe test cards: `4242 4242 4242 4242` (any future date, any CVC)
2. For PIX testing, use Stripe test mode - payment will auto-succeed
3. Trigger webhooks locally: Use Stripe CLI `stripe listen --forward-to localhost:4242/api/webhooks/stripe`
4. Check webhook signature verification is enabled in production

## Common Issues

### "Stripe account not connected"
Vendor must complete Stripe onboarding flow. Check `user.stripeOnboardingComplete` flag.

### Payment fails with "No such connected account"
Ensure `stripeAccountId` is set on User and valid. Check Stripe dashboard.

### Images not uploading
Verify Cloudinary credentials in .env. Check network tab for CORS issues.

### Checkout page 404
Offer slug must exist and offer must be published. Check offer data in MongoDB.

### Webhook not receiving events
1. Verify `STRIPE_WEBHOOK_SECRET` matches webhook endpoint in Stripe dashboard
2. Check webhook signature verification passes
3. Use `express.raw()` middleware for webhook route (already configured)

## File Structure Notes

- **api/src/services/**: Business logic and database operations
- **api/src/controllers/**: Request/response handling
- **api/src/middleware/**: Auth, file upload, error handling
- **admin/src/components/ui/**: Reusable Radix UI components (shadcn-style)
- **admin/src/pages/**: Route-level components
- **checkout/src/components/checkout/**: Checkout-specific components
- **checkout/src/i18n/translations/**: Language files (pt, en, fr)

## Security Considerations

- Never commit .env files
- Stripe webhook signature verification is critical - never skip it
- JWT secret must be strong and random in production
- Payment amounts calculated server-side, never trust client input
- Images uploaded through backend to control access to Cloudinary
