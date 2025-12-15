import { MarketplaceWarehouse } from '@/data/marketplaceWarehouses';

export interface Vehicle {
  id: string;
  driverName: string;
  driverPhone: string;
  driverLicenseNumber: string;
  carBrand: string;
  carModel: string;
  carNumber: string;
  carPhoto: File | null;
  carNumberPhoto: File | null;
  carNumberReadable: boolean | null;
  capacity: {
    boxes: number;
    pallets: number;
  };
  warehouse: MarketplaceWarehouse | null;
}
