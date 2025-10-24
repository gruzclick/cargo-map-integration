export const sanitizeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const sanitizeInput = (input: string, maxLength: number = 500): string => {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/data:text\/html/gi, '')
    .trim()
    .slice(0, maxLength);
};

export const escapeSQL = (str: string): string => {
  return str.replace(/'/g, "''").replace(/\\/g, '\\\\');
};

export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token: string, storedToken: string): boolean => {
  if (!token || !storedToken) return false;
  return token === storedToken;
};

export const secureLocalStorage = {
  set: (key: string, value: string) => {
    try {
      const encrypted = btoa(value);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  },
  
  get: (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return atob(encrypted);
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return null;
    }
  },
  
  getItem: (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return atob(encrypted);
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
      return null;
    }
  },
  
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
};

export const isValidURL = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 255);
};

export const rateLimit = (() => {
  const requests = new Map<string, number[]>();
  
  return (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const timestamps = requests.get(key) || [];
    
    const recentRequests = timestamps.filter(t => now - t < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      return false;
    }
    
    recentRequests.push(now);
    requests.set(key, recentRequests);
    return true;
  };
})();

export const validateEmail = (email: string): boolean => {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email) && email.length <= 255;
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const pattern = /^\+?7\d{10}$/;
  return pattern.test(cleaned);
};

export const validateINN = (inn: string): boolean => {
  return /^\d{10}$|^\d{12}$/.test(inn);
};