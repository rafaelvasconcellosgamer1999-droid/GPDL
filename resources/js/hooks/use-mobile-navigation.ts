// resources/js/hooks/useMobileNavigation.ts
import { useCallback } from 'react';

export function useMobileNavigation() {
  return useCallback(() => {
    try {
      document.body.style.removeProperty('pointer-events');
      localStorage.removeItem('setorSelecionado');
      localStorage.setItem('app_logout', String(Date.now()));
    } catch (err) {
      console.error('Erro em useMobileNavigation cleanup:', err);
    }
  }, []);
}
