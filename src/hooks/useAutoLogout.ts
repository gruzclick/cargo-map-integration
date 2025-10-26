import { useEffect, useRef } from 'react';

interface UseAutoLogoutOptions {
  timeout?: number;
  onLogout: () => void;
  enabled?: boolean;
}

export const useAutoLogout = ({ 
  timeout = 30 * 60 * 1000, // 30 минут по умолчанию
  onLogout,
  enabled = true
}: UseAutoLogoutOptions) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (!enabled) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    warningTimeoutRef.current = setTimeout(() => {
      const userConfirm = window.confirm(
        'Вы неактивны уже 25 минут. Через 5 минут произойдёт автоматический выход из системы. Продолжить работу?'
      );
      if (userConfirm) {
        resetTimer();
      }
    }, timeout - 5 * 60 * 1000);

    timeoutRef.current = setTimeout(() => {
      alert('Вы вышли из системы из-за длительной неактивности. Пожалуйста, войдите снова.');
      onLogout();
    }, timeout);
  };

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [timeout, onLogout, enabled]);

  return { resetTimer };
};
