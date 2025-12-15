import { Vehicle } from './types';

export const isVehicleValid = (vehicle: Vehicle): boolean => {
  return (
    !!vehicle.driverName &&
    !!vehicle.driverPhone &&
    !!vehicle.driverLicenseNumber &&
    !!vehicle.carBrand &&
    !!vehicle.carModel &&
    !!vehicle.carNumber &&
    !!vehicle.warehouse &&
    !!vehicle.carNumberPhoto &&
    vehicle.carNumberReadable === true &&
    (vehicle.capacity.boxes > 0 || vehicle.capacity.pallets > 0)
  );
};

export const checkLicensePlateReadability = (file: File, onResult: (isReadable: boolean) => void): void => {
  const img = new Image();
  const reader = new FileReader();
  
  reader.onload = (e) => {
    img.src = e.target?.result as string;
    img.onload = () => {
      const isReadable = img.width >= 800 && img.height >= 600;
      onResult(isReadable);
      
      if (!isReadable) {
        alert('⚠️ Фото с госномером нечеткое или слишком маленькое. Пожалуйста, загрузите фото лучшего качества (минимум 800×600px)');
      }
    };
  };
  
  reader.readAsDataURL(file);
};
