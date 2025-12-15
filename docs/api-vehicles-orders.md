# API документация: Автомобили и Заявки

## Обзор

Документация описывает backend API для сохранения данных автомобилей перевозчиков и заявок на отправку/перевозку грузов.

---

## 1. API для автомобилей перевозчиков

### POST `/backend/vehicles/save`

**Назначение:** Сохранить данные автомобиля и водителя в профиль пользователя

**Headers:**
```
Content-Type: application/json
X-User-Id: <user_id>
```

**Request Body:**
```json
{
  "vehicles": [
    {
      "driver_name": "Иванов Иван Иванович",
      "driver_phone": "+79991234567",
      "driver_license_number": "7711123456",
      "car_brand": "ГАЗель",
      "car_model": "Next",
      "car_number": "А123БВ199",
      "car_number_photo_url": "https://cdn.poehali.dev/...",
      "capacity_boxes": 100,
      "capacity_pallets": 4
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "saved_vehicles": [
    {
      "id": "vehicle_uuid_123",
      "driver_name": "Иванов Иван Иванович",
      "car_brand": "ГАЗель",
      "car_number": "А123БВ199",
      "created_at": "2025-12-15T04:30:00Z"
    }
  ]
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Missing required fields: driver_name, car_number"
}
```

---

### GET `/backend/vehicles/list`

**Назначение:** Получить список сохранённых автомобилей пользователя

**Headers:**
```
X-User-Id: <user_id>
```

**Response (200 OK):**
```json
{
  "success": true,
  "vehicles": [
    {
      "id": "vehicle_uuid_123",
      "driver_name": "Иванов Иван Иванович",
      "driver_phone": "+79991234567",
      "driver_license_number": "7711123456",
      "car_brand": "ГАЗель",
      "car_model": "Next",
      "car_number": "А123БВ199",
      "car_number_photo_url": "https://cdn.poehali.dev/...",
      "capacity_boxes": 100,
      "capacity_pallets": 4,
      "created_at": "2025-12-15T04:30:00Z"
    }
  ]
}
```

---

### DELETE `/backend/vehicles/{vehicle_id}`

**Назначение:** Удалить автомобиль из профиля

**Headers:**
```
X-User-Id: <user_id>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Vehicle deleted successfully"
}
```

---

## 2. API для заявок перевозчиков

### POST `/backend/orders/carrier`

**Назначение:** Создать заявку на перевозку груза

**Headers:**
```
Content-Type: application/json
X-User-Id: <user_id>
```

**Request Body:**
```json
{
  "vehicle_id": "vehicle_uuid_123",
  "warehouse": {
    "marketplace": "Wildberries",
    "city": "Москва",
    "address": "ул. Примерная, д. 123",
    "code": "WB_MSK_001"
  },
  "capacity_boxes": 100,
  "capacity_pallets": 4,
  "status": "active"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "order_id": "order_carrier_uuid_456",
  "vehicle_id": "vehicle_uuid_123",
  "warehouse": {
    "marketplace": "Wildberries",
    "city": "Москва",
    "address": "ул. Примерная, д. 123"
  },
  "status": "active",
  "created_at": "2025-12-15T05:00:00Z"
}
```

---

### GET `/backend/orders/carrier/active`

**Назначение:** Получить активную заявку перевозчика

**Headers:**
```
X-User-Id: <user_id>
```

**Response (200 OK):**
```json
{
  "success": true,
  "active_order": {
    "order_id": "order_carrier_uuid_456",
    "vehicle": {
      "car_brand": "ГАЗель",
      "car_number": "А123БВ199"
    },
    "warehouse": {
      "marketplace": "Wildberries",
      "city": "Москва",
      "address": "ул. Примерная, д. 123"
    },
    "capacity_boxes": 100,
    "capacity_pallets": 4,
    "status": "active",
    "created_at": "2025-12-15T05:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "No active orders"
}
```

---

### PATCH `/backend/orders/carrier/{order_id}/status`

**Назначение:** Обновить статус заявки

**Headers:**
```
Content-Type: application/json
X-User-Id: <user_id>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Возможные статусы:**
- `active` - активная заявка
- `in_progress` - в процессе доставки
- `completed` - завершена
- `cancelled` - отменена

**Response (200 OK):**
```json
{
  "success": true,
  "order_id": "order_carrier_uuid_456",
  "status": "completed",
  "updated_at": "2025-12-15T06:00:00Z"
}
```

---

## 3. API для заявок отправителей

### POST `/backend/orders/shipper`

**Назначение:** Создать заявку на отправку груза

**Headers:**
```
Content-Type: application/json
X-User-Id: <user_id>
```

**Request Body:**
```json
{
  "cargo_items": [
    {
      "sender_name": "Иванов Иван",
      "type": "box",
      "quantity": 50,
      "warehouse": {
        "marketplace": "Ozon",
        "city": "Санкт-Петербург",
        "address": "пр. Невский, д. 1",
        "code": "OZON_SPB_002"
      },
      "pickup_address": "Москва, ул. Тестовая, д. 10",
      "pickup_date": "2025-12-20",
      "pickup_time": "14:00",
      "contact_phone": "+79991234567",
      "photo_url": "https://cdn.poehali.dev/cargo_photo.jpg"
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "orders": [
    {
      "order_id": "order_shipper_uuid_789",
      "sender_name": "Иванов Иван",
      "type": "box",
      "quantity": 50,
      "warehouse": {
        "marketplace": "Ozon",
        "city": "Санкт-Петербург"
      },
      "pickup_date": "2025-12-20",
      "status": "pending",
      "created_at": "2025-12-15T05:30:00Z"
    }
  ]
}
```

---

### GET `/backend/orders/shipper/active`

**Назначение:** Получить активные заявки отправителя

**Headers:**
```
X-User-Id: <user_id>
```

**Response (200 OK):**
```json
{
  "success": true,
  "active_orders": [
    {
      "order_id": "order_shipper_uuid_789",
      "sender_name": "Иванов Иван",
      "type": "box",
      "quantity": 50,
      "warehouse": {
        "marketplace": "Ozon",
        "city": "Санкт-Петербург",
        "address": "пр. Невский, д. 1"
      },
      "pickup_address": "Москва, ул. Тестовая, д. 10",
      "pickup_date": "2025-12-20",
      "pickup_time": "14:00",
      "contact_phone": "+79991234567",
      "status": "pending",
      "created_at": "2025-12-15T05:30:00Z"
    }
  ]
}
```

---

### DELETE `/backend/orders/shipper/{order_id}`

**Назначение:** Отменить заявку отправителя

**Headers:**
```
X-User-Id: <user_id>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "order_id": "order_shipper_uuid_789"
}
```

---

## 4. База данных: Структура таблиц

### Таблица `vehicles`

```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    car_brand VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_number VARCHAR(20) NOT NULL UNIQUE,
    car_number_photo_url TEXT,
    capacity_boxes INTEGER DEFAULT 0,
    capacity_pallets INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_car_number (car_number)
);
```

### Таблица `orders_carrier`

```sql
CREATE TABLE orders_carrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    warehouse_marketplace VARCHAR(100) NOT NULL,
    warehouse_city VARCHAR(100) NOT NULL,
    warehouse_address TEXT NOT NULL,
    warehouse_code VARCHAR(50),
    capacity_boxes INTEGER DEFAULT 0,
    capacity_pallets INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

### Таблица `orders_shipper`

```sql
CREATE TABLE orders_shipper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    cargo_type VARCHAR(20) NOT NULL CHECK (cargo_type IN ('box', 'pallet')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    warehouse_marketplace VARCHAR(100) NOT NULL,
    warehouse_city VARCHAR(100) NOT NULL,
    warehouse_address TEXT NOT NULL,
    warehouse_code VARCHAR(50),
    pickup_address TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_pickup_date (pickup_date)
);
```

---

## 5. Миграция базы данных

Создайте файл миграции:

```sql
-- V1__create_vehicles_and_orders_tables.sql

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    driver_phone VARCHAR(20) NOT NULL,
    driver_license_number VARCHAR(20) NOT NULL,
    car_brand VARCHAR(100) NOT NULL,
    car_model VARCHAR(100) NOT NULL,
    car_number VARCHAR(20) NOT NULL,
    car_number_photo_url TEXT,
    capacity_boxes INTEGER DEFAULT 0,
    capacity_pallets INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_vehicles_car_number ON vehicles(car_number);

CREATE TABLE IF NOT EXISTS orders_carrier (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    warehouse_marketplace VARCHAR(100) NOT NULL,
    warehouse_city VARCHAR(100) NOT NULL,
    warehouse_address TEXT NOT NULL,
    warehouse_code VARCHAR(50),
    capacity_boxes INTEGER DEFAULT 0,
    capacity_pallets INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_carrier_user_id ON orders_carrier(user_id);
CREATE INDEX idx_orders_carrier_status ON orders_carrier(status);
CREATE INDEX idx_orders_carrier_created_at ON orders_carrier(created_at);

CREATE TABLE IF NOT EXISTS orders_shipper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    cargo_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    warehouse_marketplace VARCHAR(100) NOT NULL,
    warehouse_city VARCHAR(100) NOT NULL,
    warehouse_address TEXT NOT NULL,
    warehouse_code VARCHAR(50),
    pickup_address TEXT NOT NULL,
    pickup_date DATE NOT NULL,
    pickup_time TIME NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_shipper_user_id ON orders_shipper(user_id);
CREATE INDEX idx_orders_shipper_status ON orders_shipper(status);
CREATE INDEX idx_orders_shipper_pickup_date ON orders_shipper(pickup_date);
```

---

## 6. Примеры использования в Frontend

### Сохранение автомобилей после регистрации

```typescript
// В UserRoleSelectionModal.tsx
const handleCarrierComplete = async (vehicles: any[]) => {
  try {
    const response = await fetch('https://functions.poehali.dev/<function-id>', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.id
      },
      body: JSON.stringify({ vehicles })
    });

    const data = await response.json();
    
    if (data.success) {
      setSuccessMessage(`Зарегистрировано автомобилей: ${vehicles.length}`);
      setStep('success');
    }
  } catch (error) {
    console.error('Failed to save vehicles:', error);
    alert('Ошибка при сохранении данных автомобилей');
  }
};
```

### Получение сохранённых автомобилей

```typescript
// В новом компоненте VehicleSelector.tsx
const loadSavedVehicles = async () => {
  const response = await fetch('https://functions.poehali.dev/<function-id>', {
    headers: { 'X-User-Id': user.id }
  });
  
  const data = await response.json();
  
  if (data.success) {
    setVehicles(data.vehicles);
  }
};
```

### Создание заявки перевозчика

```typescript
const createCarrierOrder = async (vehicleId: string, warehouse: any) => {
  const response = await fetch('https://functions.poehali.dev/<function-id>', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': user.id
    },
    body: JSON.stringify({
      vehicle_id: vehicleId,
      warehouse,
      capacity_boxes: 100,
      capacity_pallets: 4,
      status: 'active'
    })
  });

  const data = await response.json();
  return data;
};
```

---

## 7. Следующие шаги реализации

1. **Создать миграцию базы данных** - запустить SQL из раздела 5
2. **Создать backend функции:**
   - `/backend/vehicles-save/index.py`
   - `/backend/vehicles-list/index.py`
   - `/backend/vehicles-delete/index.py`
   - `/backend/orders-carrier-create/index.py`
   - `/backend/orders-carrier-active/index.py`
   - `/backend/orders-shipper-create/index.py`
   - `/backend/orders-shipper-active/index.py`

3. **Обновить frontend:**
   - Интегрировать API вызовы в `UserRoleSelectionModal.tsx`
   - Создать компонент `MyVehicles.tsx` в профиле
   - Создать компонент `MyActiveOrder.tsx` для боковой панели
   - Добавить логику повторного использования сохранённых данных

---

## 8. Безопасность

- ✅ Всегда проверять `X-User-Id` в backend
- ✅ Запретить доступ к чужим автомобилям/заявкам
- ✅ Валидировать все входные данные (номера телефонов, даты, количества)
- ✅ Санитизировать текстовые поля против SQL-injection
- ✅ Ограничить размер загружаемых фото (максимум 5MB)
- ✅ Хранить фото в S3, а не в базе данных

---

Документация готова к использованию разработчиками backend!
