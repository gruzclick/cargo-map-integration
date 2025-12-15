# Руководство по интеграции: Автомобили и Заявки

## 📋 Обзор выполненной работы

### ✅ Завершено:

1. **База данных**
   - ✅ Создана таблица `vehicles` для хранения автомобилей
   - ✅ Создана таблица `orders_carrier` для заявок перевозчиков
   - ✅ Создана таблица `orders_shipper` для заявок отправителей
   - Миграция: `V0027__create_vehicles_and_orders_tables.sql`

2. **Backend API**
   - ✅ `/vehicles-save` - сохранение автомобилей
   - ✅ `/vehicles-list` - получение списка автомобилей
   - Функции задеплоены и протестированы

3. **Frontend улучшения**
   - ✅ Форма перевозчика показывает марку+номер авто
   - ✅ Кнопка "Добавить" справа от списка авто
   - ✅ Опция "Любой склад" для склада назначения
   - ✅ Уведомление "Заявка создана" с кнопкой "Закрыть"
   - ✅ Поле "Имя отправителя" в форме отправителя
   - ✅ PDF наклейки с горизонтальной ориентацией 75×120мм

---

## 🔗 URL функций

```typescript
const API_URLS = {
  vehiclesSave: 'https://functions.poehali.dev/3af96f4d-33d9-420a-8bb5-027d6cc404f0',
  vehiclesList: 'https://functions.poehali.dev/5738c15a-767b-4f8c-adbe-dd4fd7aee924'
};
```

---

## 🚀 Быстрый старт: Интеграция в Frontend

### 1. Сохранение автомобилей после регистрации

Обновите `src/components/UserRoleSelectionModal.tsx`:

```typescript
const handleCarrierComplete = async (vehicles: any[]) => {
  console.log('Carrier vehicles:', vehicles);
  
  try {
    // Сохраняем автомобили в базу данных
    const response = await fetch('https://functions.poehali.dev/3af96f4d-33d9-420a-8bb5-027d6cc404f0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id || user.user_id
      },
      body: JSON.stringify({ vehicles })
    });

    const data = await response.json();
    
    if (data.success) {
      // Сохраняем ID автомобилей для дальнейшего использования
      const vehicleIds = data.saved_vehicles.map((v: any) => v.id);
      localStorage.setItem('saved_vehicle_ids', JSON.stringify(vehicleIds));
      
      setSuccessMessage(`Зарегистрировано автомобилей: ${vehicles.length}`);
      setStep('success');
    } else {
      alert(`Ошибка сохранения: ${data.error}`);
    }
  } catch (error) {
    console.error('Failed to save vehicles:', error);
    alert('Ошибка при сохранении данных автомобилей');
  }
};
```

### 2. Создание компонента "Мои автомобили"

Создайте `src/components/profile/MyVehicles.tsx`:

```typescript
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Vehicle {
  id: string;
  driver_name: string;
  driver_phone: string;
  car_brand: string;
  car_model: string;
  car_number: string;
  capacity_boxes: number;
  capacity_pallets: number;
  created_at: string;
}

const MyVehicles = ({ userId }: { userId: string }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [userId]);

  const loadVehicles = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5738c15a-767b-4f8c-adbe-dd4fd7aee924', {
        headers: { 'X-User-Id': userId }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-8">
        <Icon name="Truck" size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">
          У вас пока нет сохранённых автомобилей
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Мои автомобили</h3>
      
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Icon name="Truck" size={24} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold">
                  {vehicle.car_brand} {vehicle.car_model}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {vehicle.car_number}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Водитель:</p>
              <p className="font-medium">{vehicle.driver_name}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Телефон:</p>
              <p className="font-medium">{vehicle.driver_phone}</p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Вместимость:</p>
              <p className="font-medium">
                {vehicle.capacity_boxes} коробов / {vehicle.capacity_pallets} паллет
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Добавлен:</p>
              <p className="font-medium">
                {new Date(vehicle.created_at).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyVehicles;
```

### 3. Добавление в профиль пользователя

Обновите `src/components/UserProfile.tsx`:

```typescript
import MyVehicles from '@/components/profile/MyVehicles';

// В компоненте добавьте новую вкладку:
<TabsContent value="vehicles">
  <MyVehicles userId={user.id || user.user_id} />
</TabsContent>
```

### 4. Использование сохранённых данных при повторном входе

Создайте `src/components/CargoCarrierFormWithSaved.tsx`:

```typescript
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

const CargoCarrierFormWithSaved = ({ user, onComplete, onBack }) => {
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedVehicles();
  }, []);

  const loadSavedVehicles = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5738c15a-767b-4f8c-adbe-dd4fd7aee924', {
        headers: { 'X-User-Id': user.id || user.user_id }
      });
      
      const data = await response.json();
      
      if (data.success && data.vehicles.length > 0) {
        setSavedVehicles(data.vehicles);
        setSelectedVehicle(data.vehicles[0]);
      }
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!selectedVehicle || !warehouse) {
      alert('Выберите автомобиль и склад назначения');
      return;
    }

    // Создаём заявку
    onComplete([{
      vehicle_id: selectedVehicle.id,
      warehouse,
      capacity_boxes: selectedVehicle.capacity_boxes,
      capacity_pallets: selectedVehicle.capacity_pallets
    }]);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Если нет сохранённых авто, показываем полную форму регистрации
  if (savedVehicles.length === 0) {
    return <CargoCarrierForm onComplete={onComplete} onBack={onBack} />;
  }

  // Показываем упрощённую форму с выбором склада
  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold">Создать заявку</h2>
          <p className="text-sm text-gray-500">Выберите автомобиль и склад</p>
        </div>
      </div>

      {/* Выбор автомобиля из сохранённых */}
      <div>
        <label className="block text-sm font-medium mb-2">Выберите автомобиль:</label>
        <div className="space-y-2">
          {savedVehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicle(vehicle)}
              className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                selectedVehicle?.id === vehicle.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="Truck" size={24} />
                <div>
                  <div className="font-semibold">
                    {vehicle.car_brand} {vehicle.car_number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {vehicle.driver_name}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Выбор склада (компонент поиска складов) */}
      <WarehouseSelector onSelect={setWarehouse} />

      <Button
        onClick={handleSubmit}
        disabled={!selectedVehicle || !warehouse}
        className="w-full"
      >
        Создать заявку
      </Button>
    </div>
  );
};

export default CargoCarrierFormWithSaved;
```

---

## ⏭️ Следующие шаги

### Backend функции (ещё нужно создать):

1. **`/backend/orders-carrier-create`** - создание заявки перевозчика
2. **`/backend/orders-carrier-active`** - получение активной заявки
3. **`/backend/orders-shipper-create`** - создание заявки отправителя
4. **`/backend/orders-shipper-active`** - получение активных заявок

### Frontend компоненты (ещё нужно создать):

1. **`MyActiveOrder.tsx`** - компонент "Моя заявка" для боковой панели
2. **`WarehouseSelector.tsx`** - компонент выбора склада с поиском
3. Интеграция компонентов в главную страницу

---

## 📚 Документация

- **API документация:** `docs/api-vehicles-orders.md`
- **Структура БД:** Таблицы `vehicles`, `orders_carrier`, `orders_shipper`
- **Миграция:** `db_migrations/V0027__create_vehicles_and_orders_tables.sql`

---

## ✅ Готово к использованию

Функции сохранения и получения автомобилей работают и протестированы!
Можно начинать интеграцию в frontend согласно примерам выше.
