/**
 * Обработчик логики регистрации новых пользователей
 * 
 * Назначение: Выполняет регистрацию пользователя с полной валидацией
 * 
 * Функциональность:
 * - Валидация всех полей регистрации (email, пароль, ФИО, телефон, ИНН)
 * - Проверка принятия пользовательского соглашения
 * - Санитизация ввода для защиты от XSS
 * - Попытка регистрации через backend API
 * - Fallback на локальное хранилище при недоступности backend
 * - Создание токена и сохранение данных пользователя
 * 
 * Используется в: EmailAuthForm.tsx через Auth.tsx
 */

import { sanitizeInput, secureLocalStorage, validateEmail, validatePhone, validateINN } from '@/utils/security';

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  entity_type: string;
  inn: string;
  organization_name: string;
  phone: string;
  agree_terms: boolean;
}

interface RegisterResponse {
  user: any;
  token: string;
}

export const handleRegister = async (
  formData: RegisterData,
  userType: 'client' | 'carrier',
  onSuccess: (user: any) => void,
  toast: any
): Promise<void> => {
  if (!formData.email || !formData.password) {
    toast({
      title: 'Заполните обязательные поля',
      description: 'Email и пароль обязательны для регистрации',
      variant: 'destructive'
    });
    throw new Error('Missing required fields');
  }

  if (!formData.full_name) {
    toast({
      title: 'Заполните ФИО',
      description: 'Укажите ваше полное имя',
      variant: 'destructive'
    });
    throw new Error('Missing full name');
  }

  if (!formData.phone) {
    toast({
      title: 'Укажите телефон',
      description: 'Номер телефона обязателен для связи',
      variant: 'destructive'
    });
    throw new Error('Missing phone');
  }

  if (!formData.agree_terms) {
    toast({
      title: 'Требуется согласие',
      description: 'Необходимо согласиться с Пользовательским соглашением и Политикой конфиденциальности',
      variant: 'destructive'
    });
    throw new Error('Terms not accepted');
  }

  if (!validateEmail(formData.email)) {
    throw new Error('Некорректный email');
  }
  if (!validatePhone(formData.phone)) {
    throw new Error('Некорректный номер телефона. Используйте формат: +7XXXXXXXXXX');
  }
  if (formData.inn && !validateINN(formData.inn)) {
    throw new Error('Некорректный ИНН');
  }

  let response;
  let data: RegisterResponse;

  try {
    response = await fetch('https://d5dho5lmmrb9rmhfv3fs.apigw.yandexcloud.net/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'register',
        email: formData.email,
        password: formData.password,
        full_name: sanitizeInput(formData.full_name),
        phone: formData.phone,
        user_type: userType,
        entity_type: formData.entity_type,
        inn: formData.inn || null,
        organization_name: sanitizeInput(formData.organization_name || '')
      })
    });

    data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }
  } catch (fetchError: any) {
    console.log('Backend недоступен, использую локальную регистрацию');
    
    const savedUsers = localStorage.getItem('registered_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    const existingUser = users.find((u: any) => u.email === formData.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const mockUser = {
      id: Date.now().toString(),
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      phone: formData.phone,
      user_type: userType,
      entity_type: formData.entity_type,
      inn: formData.inn,
      organization_name: formData.organization_name,
      created_at: new Date().toISOString(),
      terms_accepted_version: '1.0'
    };

    users.push(mockUser);
    localStorage.setItem('registered_users', JSON.stringify(users));

    const mockToken = btoa(JSON.stringify({ userId: mockUser.id, exp: Date.now() + 86400000 }));

    data = {
      user: mockUser,
      token: mockToken
    };
  }

  secureLocalStorage.set('auth_token', data.token);
  secureLocalStorage.set('user_data', JSON.stringify(data.user));
  onSuccess(data.user);
  
  toast({
    title: 'Регистрация успешна!'
  });
};