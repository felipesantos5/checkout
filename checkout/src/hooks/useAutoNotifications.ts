// src/hooks/useAutoNotifications.ts
import { useEffect, useRef, useCallback } from 'react';
import { notificationNames, type Region, type Gender } from '../data/notificationNames';

export interface AutoNotificationsConfig {
  enabled: boolean;
  genderFilter: 'all' | 'male' | 'female';
  region: Region;
  intervalSeconds: number;
  soundEnabled: boolean;
}

interface UseAutoNotificationsProps {
  config?: AutoNotificationsConfig;
  onNotification: (name: string) => void;
}

function getRandomName(region: Region, genderFilter: 'all' | 'male' | 'female'): string {
  const regionNames = notificationNames[region];

  let availableNames: string[];

  if (genderFilter === 'all') {
    availableNames = [...regionNames.male, ...regionNames.female];
  } else {
    availableNames = regionNames[genderFilter as Gender];
  }

  const randomIndex = Math.floor(Math.random() * availableNames.length);
  return availableNames[randomIndex];
}

export function useAutoNotifications({ config, onNotification }: UseAutoNotificationsProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isActiveRef = useRef(false);

  const showNotification = useCallback(() => {
    if (!config || !isActiveRef.current) return;

    const name = getRandomName(config.region, config.genderFilter);
    onNotification(name);
  }, [config, onNotification]);

  useEffect(() => {
    if (!config?.enabled) {
      isActiveRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    isActiveRef.current = true;
    const intervalMs = config.intervalSeconds * 1000;

    // Exibe a primeira notificação após um delay inicial aleatório (3-8 segundos)
    const initialDelay = 3000 + Math.random() * 5000;

    const initialTimeout = setTimeout(() => {
      if (isActiveRef.current) {
        showNotification();

        // Inicia o intervalo regular
        intervalRef.current = setInterval(() => {
          if (isActiveRef.current) {
            showNotification();
          }
        }, intervalMs);
      }
    }, initialDelay);

    return () => {
      isActiveRef.current = false;
      clearTimeout(initialTimeout);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [config?.enabled, config?.intervalSeconds, config?.region, config?.genderFilter, showNotification]);

  return null;
}
