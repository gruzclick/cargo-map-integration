/**
 * Обработчик логики входа в систему
 * 
 * Назначение: Выполняет авторизацию пользователя через backend или localStorage
 * 
 * Функциональность:
 * - Валидация введённых данных (email, пароль)
 * - Попытка входа через backend API
 * - Fallback на локальное хранилище при недоступности backend
 * - Сохранение токена и данных пользователя после успешного входа
 * - Обработка сценария с необходимостью принятия новых условий
 * 
 * Используется в: EmailAuthForm.tsx через Auth.tsx
 */

import { secureLocalStorage } from '@/utils/security';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  user: any;
  token: string;
  needs_agreement?: boolean;
}

export const handleLogin = async (
  formData: LoginData,
  onSuccess: (user: any) => void,
  toast: any
): Promise<void> => {
  if (!formData.email || !formData.password) {
    throw new Error('Заполните email и пароль');
  }

  let response;
  let data: LoginResponse;

  try {
    response = await fetch('https://d5dho5lmmrb9rmhfv3fs.apigw.yandexcloud.net/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: formData.email,
        password: formData.password
      })
    });

    data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }
  } catch (fetchError: any) {
    console.log('Backend недоступен, использую локальную авторизацию');
    
    const savedUsers = localStorage.getItem('registered_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    const user = users.find((u: any) => u.email === formData.email);
    
    if (!user) {
      throw new Error('Пользователь не найден. Зарегистрируйтесь сначала.');
    }

    if (user.password !== formData.password) {
      throw new Error('Неверный пароль');
    }

    const mockToken = btoa(JSON.stringify({ userId: user.id, exp: Date.now() + 86400000 }));

    data = {
      user: user,
      token: mockToken
    };
  }

  if (data.needs_agreement) {
    secureLocalStorage.set('pending_auth', JSON.stringify({ token: data.token, user: data.user }));
    secureLocalStorage.set('needs_terms_update', 'true');
    window.location.reload();
    return;
  }

  secureLocalStorage.set('auth_token', data.token);
  secureLocalStorage.set('user_data', JSON.stringify(data.user));
  onSuccess(data.user);
  
  toast({
    title: 'Вход выполнен успешно!'
  });
};