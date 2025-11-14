// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { CheckoutSlugPage } from "./pages/CheckoutSlugPage";

function App() {
  return (
    <Routes>
      {/* A rota /c/:slug será a rota pública do seu checkout.
        Ex: /c/PPU38CQ31871R51
      */}
      <Route path="/c/:slug" element={<CheckoutSlugPage />} />

      <Route
        path="/"
        element={
          <div>
            <h1>Página Inicial</h1>
            <p>Vá para /c/[seu_slug] para ver um checkout.</p>
          </div>
        }
      />
      <Route
        path="*"
        element={
          <div>
            <h1>404 - Página Não Encontrada</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
