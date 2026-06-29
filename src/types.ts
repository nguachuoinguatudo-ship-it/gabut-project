/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ProductCategory = 'kopi' | 'non-kopi' | 'makanan-berat' | 'cemilan' | 'pencuci-mulut';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  tags?: string[];
  isAvailable: boolean;
}

export type CoffeeSize = 'Regular' | 'Large';
export type IceLevel = 'Normal Ice' | 'Less Ice' | 'No Ice';
export type SugarLevel = 'Normal Sugar' | 'Less Sugar' | 'No Sugar';

export interface CartItem {
  id: string; // unique cart item id (e.g. productId + size + ice + sugar)
  product: Product;
  quantity: number;
  notes?: string;
  selectedSize?: CoffeeSize;
  selectedIce?: IceLevel;
  selectedSugar?: SugarLevel;
}

export type PaymentMethodId = 'gopay' | 'ovo' | 'shopeepay' | 'qris' | 'transfer_bank';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  logo: string; // Tailwind icon name or description
  color: string; // Tailwind class
}

export type OrderStatus = 'pembayaran' | 'diproses' | 'diracik' | 'siap' | 'selesai';

export type DiningOption = 'dine_in' | 'takeaway';

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  serviceCharge: number;
  total: number;
  diningOption: DiningOption;
  paymentMethod: PaymentMethodId;
  status: OrderStatus;
  createdAt: string;
  estimatedTimeMinutes: number;
  customerName: string;
  tableNumber?: string;
  appliedPromo?: string;
}
