/**
 * Проверяет, может ли пользователь создавать заявки на основе рейтинга
 */
export const canCreateOrder = (userRating: number): { allowed: boolean; message?: string } => {
  const limitsData = localStorage.getItem('system_limits');
  
  if (!limitsData) {
    // Если лимиты не заданы, разрешаем всем
    return { allowed: true };
  }

  try {
    const limits = JSON.parse(limitsData);
    const minRating = limits.minRating || 0;

    if (userRating < minRating) {
      return {
        allowed: false,
        message: `Для создания заявок требуется рейтинг не ниже ${minRating.toFixed(1)}. Ваш рейтинг: ${userRating.toFixed(1)}`
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Ошибка проверки рейтинга:', error);
    return { allowed: true };
  }
};

/**
 * Получает минимальный рейтинг из настроек
 */
export const getMinimumRating = (): number => {
  const limitsData = localStorage.getItem('system_limits');
  
  if (!limitsData) {
    return 0;
  }

  try {
    const limits = JSON.parse(limitsData);
    return limits.minRating || 0;
  } catch (error) {
    console.error('Ошибка получения минимального рейтинга:', error);
    return 0;
  }
};
