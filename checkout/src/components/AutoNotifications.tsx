// src/components/AutoNotifications.tsx
// COMPONENTE ISOLADO - Se falhar, não afeta a aplicação principal
import { useEffect, useRef, useState } from 'react';
import { notificationNames } from '../data/notificationNames';
import { toast } from 'sonner';

interface AutoNotificationsConfig {
  enabled: boolean;
  genderFilter: 'all' | 'male' | 'female';
  region: 'pt' | 'en' | 'es' | 'fr';
  intervalSeconds?: number;
  soundEnabled?: boolean;
}

interface AutoNotificationsProps {
  config?: AutoNotificationsConfig;
  productName: string;
}

// Nomes fallback simples
const FALLBACK_NAMES = ['João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia'];

// Componente de notificação isolado
export function AutoNotifications({ config, productName }: AutoNotificationsProps) {
  const [isReady, setIsReady] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const usedNamesRef = useRef<Set<string>>(new Set());
  const namesRef = useRef<string[]>(FALLBACK_NAMES);
  const toastRef = useRef<any>(null);

  // Carrega dependências de forma assíncrona
  useEffect(() => {
    let mounted = true;

    const loadDependencies = async () => {
      try {
        if (!mounted) return;
        toastRef.current = toast;

        // Carrega nomes
        try {
          if (!mounted) return;

          const region = config?.region || 'pt';
          const genderFilter = config?.genderFilter || 'all';
          const regionData = notificationNames?.[region];

          if (regionData) {
            if (genderFilter === 'all') {
              namesRef.current = [...(regionData.male || []), ...(regionData.female || [])];
            } else if (genderFilter === 'male') {
              namesRef.current = regionData.male || FALLBACK_NAMES;
            } else {
              namesRef.current = regionData.female || FALLBACK_NAMES;
            }
          }
        } catch {
          // Usa fallback se falhar
        }

        setIsReady(true);
      } catch {
        // Se falhar ao carregar sonner, simplesmente não faz nada
      }
    };

    loadDependencies();

    return () => {
      mounted = false;
    };
  }, [config?.region, config?.genderFilter]);

  // Lógica de notificações
  useEffect(() => {
    if (!isReady || !config?.enabled || !toastRef.current) return;

    const getRandomName = (): string => {
      try {
        const names = namesRef.current;
        if (!names.length) return 'Cliente';

        const unused = names.filter(n => !usedNamesRef.current.has(n));
        if (!unused.length) {
          usedNamesRef.current.clear();
          return names[Math.floor(Math.random() * names.length)];
        }

        const name = unused[Math.floor(Math.random() * unused.length)];
        usedNamesRef.current.add(name);
        if (usedNamesRef.current.size > 20) {
          const first = usedNamesRef.current.values().next().value;
          if (first) usedNamesRef.current.delete(first);
        }
        return name;
      } catch {
        return 'Cliente';
      }
    };

    const playSound = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // Ignora
      }
    };

    const showNotification = () => {
      try {
        const toast = toastRef.current;
        if (!toast?.success) return;

        const name = getRandomName();
        const message = `${name} acabou de garantir o ${productName || 'produto'}`;

        if (config.soundEnabled === true) {
          playSound();
        }

        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

        toast.success(message, {
          duration: 3000,
          position: isDesktop ? 'bottom-right' : 'top-right',
          style: { background: '#10B981', color: '#FFFFFF', border: 'none' },
          icon: '🎉',
        });
      } catch {
        // Ignora erros
      }
    };

    const intervalMs = (config.intervalSeconds && config.intervalSeconds > 0)
      ? config.intervalSeconds * 1000
      : 10000;

    const timeout = window.setTimeout(() => {
      showNotification();
      intervalRef.current = window.setInterval(showNotification, intervalMs);
    }, 5000);

    return () => {
      window.clearTimeout(timeout);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isReady, config?.enabled, config?.intervalSeconds, config?.soundEnabled, productName]);

  // Este componente não renderiza nada
  return null;
}
