import { MarketplaceWarehouse } from '@/data/marketplaceWarehouses';

export interface CargoItem {
  id: string;
  boxQuantity: number;
  palletQuantity: number;
  warehouse: MarketplaceWarehouse | null;
  pickupAddress: string;
  pickupInstructions: string;
  pickupDate: string;
  pickupTime: string;
  deliveryDate?: string;
  photo: File | null;
  contactPhone: string;
  senderName: string;
}

export interface YandexSuggestion {
  title: string;
  subtitle?: string;
  description: string;
}