import { Request, Response } from "express";

export const getUpsellScript = (req: Request, res: Response) => {
  const scriptContent = `
(function() {
  console.log("🚀 SnappCheckout Upsell Loaded");

  // 1. Injeta os Estilos Padrão (Opcional, o cliente pode querer estilizar do jeito dele)
  const style = document.createElement('style');
  style.innerHTML = \`
    .chk-btn-loading { opacity: 0.7; cursor: wait; pointer-events: none; }
  \`;
  document.head.appendChild(style);

  // 2. Função Principal de Processamento
  async function handleUpsellAction(isBuy, btnElement) {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      console.error("❌ Token de upsell não encontrado na URL.");
      alert('Erro: Link inválido (Token ausente).');
      return;
    }

    const originalText = btnElement.innerText;
    btnElement.innerText = "PROCESSANDO...";
    btnElement.classList.add("chk-btn-loading");
    
    // Desabilita todos os botões de upsell para evitar duplo clique
    document.querySelectorAll('.chk-buy, .chk-refuse').forEach(b => b.disabled = true);

    try {
      const endpoint = isBuy ? 'one-click-upsell' : 'upsell-refuse';
      // Usa a URL de origem do script para saber onde chamar a API, ou fixa a URL da API
      const apiUrl = "https://backend.snappcheckout.com.br/api"; // Ajuste para sua URL real

      const res = await fetch(apiUrl + '/payments/' + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      const data = await res.json();

      if (data.success) {
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          alert(data.message || (isBuy ? 'Compra realizada!' : 'Oferta recusada.'));
          // Se não tiver redirect, reabilita (caso raro)
          window.location.reload(); 
        }
      } else {
        throw new Error(data.message || 'Erro desconhecido');
      }
      
    } catch (e) {
      alert(e.message || 'Erro de conexão. Tente novamente.');
      // Reabilita os botões em caso de erro
      document.querySelectorAll('.chk-buy, .chk-refuse').forEach(b => b.disabled = false);
      btnElement.innerText = originalText;
      btnElement.classList.remove("chk-btn-loading");
    }
  }

  // 3. Auto-Inicialização (Ouve os cliques automaticamente)
  document.addEventListener("DOMContentLoaded", () => {
    // Encontra botões de compra
    const buyBtns = document.querySelectorAll('.chk-buy');
    buyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleUpsellAction(true, e.target);
      });
    });

    // Encontra botões de recusa
    const refuseBtns = document.querySelectorAll('.chk-refuse');
    refuseBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleUpsellAction(false, e.target);
      });
    });
  });
})();
  `;

  // Retorna como Javascript
  res.setHeader("Content-Type", "application/javascript");
  res.send(scriptContent);
};
