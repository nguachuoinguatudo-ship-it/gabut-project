/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Trash2, ArrowRight, Sparkles, Tag, Plus, Minus, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, DiningOption, PaymentMethodId } from '../types';
import { PROMO_CODES } from '../data/products';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, newQty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onConfirmOrder: (orderData: {
    customerName: string;
    diningOption: DiningOption;
    tableNumber?: string;
    appliedPromo?: string;
    discountAmount: number;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
  }) => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onConfirmOrder,
}: CartSidebarProps) {
  const [diningOption, setDiningOption] = useState<DiningOption>('dine_in');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Pricing Calculations
  const subtotal = cart.reduce((total, item) => {
    const sizeAdjustment = item.selectedSize === 'Large' ? 5000 : 0;
    return total + (item.product.price + sizeAdjustment) * item.quantity;
  }, 0);

  // Apply Promo Discount
  let discountAmount = 0;
  if (activePromo && PROMO_CODES[activePromo]) {
    const promo = PROMO_CODES[activePromo];
    if (subtotal >= promo.minSpend) {
      discountAmount = Math.round(subtotal * (promo.discountPercent / 100));
    } else {
      // Auto-invalidate if subtotal falls below minimum spend
      discountAmount = 0;
    }
  }

  const tax = Math.round((subtotal - discountAmount) * 0.11); // 11% PB1 Tax
  const serviceCharge = diningOption === 'dine_in' ? Math.round((subtotal - discountAmount) * 0.05) : 0; // 5% for dine in
  const total = subtotal - discountAmount + tax + serviceCharge;

  const handleApplyPromo = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    if (PROMO_CODES[cleanCode]) {
      const promo = PROMO_CODES[cleanCode];
      if (subtotal >= promo.minSpend) {
        setActivePromo(cleanCode);
        setPromoError(null);
      } else {
        setPromoError(`Minimal belanja untuk promo ini adalah ${formatRupiah(promo.minSpend)}.`);
        setActivePromo(null);
      }
    } else {
      setPromoError('Kode promo tidak valid.');
      setActivePromo(null);
    }
  };

  const handleRemovePromo = () => {
    setActivePromo(null);
    setPromoInput('');
    setPromoError(null);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    if (diningOption === 'dine_in' && !tableNumber.trim()) return;

    onConfirmOrder({
      customerName: customerName.trim(),
      diningOption,
      tableNumber: diningOption === 'dine_in' ? tableNumber.trim() : undefined,
      appliedPromo: activePromo || undefined,
      discountAmount,
      subtotal,
      tax,
      serviceCharge,
      total,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-900/40 backdrop-blur-xs"
        />

        {/* Slide-out Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-brand-100"
            id="cart-sidebar-panel"
          >
            {/* Header */}
            <div className="p-4 border-b border-brand-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-brand-900 text-lg">Keranjang Belanja</span>
                <span className="bg-brand-100 text-brand-800 text-xs font-bold px-2 py-0.5 rounded-full">
                  {cart.reduce((s, i) => s + i.quantity, 0)} Item
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-brand-100 text-brand-500 hover:text-brand-800 hover:bg-brand-50"
                aria-label="Tutup"
                id="cart-close-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Cart Content */}
            <div className="flex-grow overflow-y-auto p-4 space-y-6">
              {cart.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-400">
                    <Trash2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-900 text-base">Keranjang Anda Kosong</h4>
                    <p className="text-xs text-brand-500 max-w-xs mt-1">
                      Silakan pilih menu favorit Anda di etalase dan masukkan ke dalam keranjang.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider">Item Pesanan</h3>
                    <div className="space-y-3 divide-y divide-brand-50">
                      {cart.map((item) => {
                        const sizeAdjustment = item.selectedSize === 'Large' ? 5000 : 0;
                        const itemPrice = item.product.price + sizeAdjustment;
                        
                        return (
                          <div key={item.id} className="pt-3 first:pt-0 flex gap-3 group" id={`cart-item-${item.id}`}>
                            {/* Small product image */}
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-14 h-14 object-cover rounded-xl bg-brand-50 border border-brand-100"
                              referrerPolicy="no-referrer"
                            />

                            {/* Details info */}
                            <div className="flex-grow min-w-0">
                              <h4 className="font-bold text-brand-900 text-sm truncate leading-snug">
                                {item.product.name}
                              </h4>
                              
                              {/* Customizations display */}
                              {(item.selectedSize || item.selectedIce || item.selectedSugar) && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {item.selectedSize && (
                                    <span className="bg-brand-50 text-brand-700 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-brand-100/50">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedIce && (
                                    <span className="bg-blue-50 text-blue-700 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-blue-100/50">
                                      {item.selectedIce === 'Normal Ice' ? 'Normal Es' : item.selectedIce === 'Less Ice' ? 'Sedikit Es' : 'Tanpa Es'}
                                    </span>
                                  )}
                                  {item.selectedSugar && (
                                    <span className="bg-amber-50 text-amber-800 text-[9px] font-semibold px-1.5 py-0.5 rounded border border-amber-100/50">
                                      {item.selectedSugar === 'Normal Sugar' ? 'Sari Normal' : item.selectedSugar === 'Less Sugar' ? 'Sedikit Gula' : 'Tanpa Gula'}
                                    </span>
                                  )}
                                </div>
                              )}

                              {item.notes && (
                                <p className="text-[10px] text-amber-700 mt-1 italic font-medium">
                                  "{item.notes}"
                                </p>
                              )}

                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs font-bold text-brand-800">
                                  {formatRupiah(itemPrice * item.quantity)}
                                </span>

                                {/* Qty adjustments inside cart */}
                                <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-100/60 rounded-lg p-0.5 scale-90 origin-right">
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-white text-brand-800 hover:bg-brand-100 active:scale-95 border border-brand-100/50"
                                    aria-label="Kurang Qty"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-6 text-center font-bold text-brand-900 text-xs">{item.quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded bg-white text-brand-800 hover:bg-brand-100 active:scale-95 border border-brand-100/50"
                                    aria-label="Tambah Qty"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-brand-300 hover:text-red-500 p-1 self-start transition-colors"
                              aria-label="Hapus Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Delivery / Dining Settings Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-brand-100">
                    <h3 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider">Opsi Makan & Informasi</h3>
                    
                    {/* Toggle Switch */}
                    <div className="grid grid-cols-2 gap-2 bg-brand-50 p-1.5 rounded-xl border border-brand-100">
                      <button
                        type="button"
                        onClick={() => setDiningOption('dine_in')}
                        className={`py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                          diningOption === 'dine_in'
                            ? 'bg-white text-brand-900 shadow-sm font-bold'
                            : 'text-brand-500 hover:text-brand-800'
                        }`}
                        id="dining-opt-dine-in"
                      >
                        Makan Di Sini (Dine In)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiningOption('takeaway')}
                        className={`py-2 rounded-lg text-xs font-semibold text-center transition-all ${
                          diningOption === 'takeaway'
                            ? 'bg-white text-brand-900 shadow-sm font-bold'
                            : 'text-brand-500 hover:text-brand-800'
                        }`}
                        id="dining-opt-takeaway"
                      >
                        Bawa Pulang (Takeaway)
                      </button>
                    </div>

                    {/* Dining Details Input */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-1">
                          Nama Pelanggan <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Masukkan nama Anda..."
                          className="w-full text-xs border border-brand-100 rounded-xl p-3 bg-white focus:outline-hidden focus:border-brand-500 text-brand-800"
                          id="customer-name-input"
                        />
                      </div>

                      {diningOption === 'dine_in' ? (
                        <div>
                          <label className="block text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-1">
                            Nomor Meja <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={diningOption === 'dine_in'}
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="Contoh: Meja 04, VIP 2..."
                            className="w-full text-xs border border-brand-100 rounded-xl p-3 bg-white focus:outline-hidden focus:border-brand-500 text-brand-800"
                            id="table-number-input"
                          />
                        </div>
                      ) : (
                        <div className="bg-brand-50 p-3 rounded-xl border border-brand-100 text-[11px] text-brand-600 flex items-start gap-2">
                          <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                          <span>
                            Untuk pesanan <strong>Takeaway</strong>, harap ambil pesanan Anda langsung di kasir bar barista ketika status pesanan dinyatakan <strong>Siap Diambil</strong>.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Voucher / Promo code */}
                    <div className="pt-2">
                      <label className="block text-[11px] font-bold text-brand-700 uppercase tracking-wider mb-1">
                        Kupon Promo
                      </label>
                      <div className="space-y-1.5">
                        {activePromo ? (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                            <div className="flex items-center gap-2 text-emerald-800 font-medium">
                              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                              <div>
                                <span className="font-bold tracking-wide">{activePromo}</span>
                                <span className="block text-[10px] text-emerald-600 font-normal">
                                  {PROMO_CODES[activePromo].description}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemovePromo}
                              className="text-emerald-700 hover:text-red-600 font-bold p-1"
                              id="remove-promo-btn"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <div className="relative flex-grow">
                              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                              <input
                                type="text"
                                value={promoInput}
                                onChange={(e) => setPromoInput(e.target.value)}
                                placeholder="SENJABARU, KOPIHEMAT..."
                                className="w-full text-xs border border-brand-100 rounded-xl pl-9 pr-3 py-3 bg-white focus:outline-hidden focus:border-brand-500 text-brand-800 uppercase"
                                id="promo-code-input"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleApplyPromo(promoInput)}
                              className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-900 transition-colors"
                              id="apply-promo-btn"
                            >
                              Pakai
                            </button>
                          </div>
                        )}
                        
                        {promoError && (
                          <p className="text-[10px] text-red-600 font-medium mt-1">
                            {promoError}
                          </p>
                        )}

                        {/* Tip showing available codes */}
                        {!activePromo && (
                          <div className="bg-brand-50/50 p-2.5 rounded-lg border border-brand-100 flex flex-col gap-1 mt-2">
                            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider flex items-center gap-1">
                              💡 Kode Promo Tersedia (Klik untuk Salin):
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {Object.keys(PROMO_CODES).map((code) => (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => {
                                    setPromoInput(code);
                                    handleApplyPromo(code);
                                  }}
                                  className="text-[10px] bg-white hover:bg-brand-100 border border-brand-200/60 rounded px-2 py-1 text-brand-700 font-bold font-mono shadow-2xs cursor-pointer"
                                  id={`quick-promo-${code.toLowerCase()}`}
                                >
                                  {code}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invoice Pricing Details */}
                    <div className="bg-brand-50/80 border border-brand-100 rounded-2xl p-4 space-y-2.5 mt-4 text-xs">
                      <div className="flex justify-between text-brand-600">
                        <span>Subtotal</span>
                        <span>{formatRupiah(subtotal)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium">
                          <span>Diskon Promo</span>
                          <span>-{formatRupiah(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-brand-600">
                        <span className="flex items-center gap-1">
                          PB1 Restaurant Tax (11%)
                        </span>
                        <span>{formatRupiah(tax)}</span>
                      </div>
                      {diningOption === 'dine_in' && (
                        <div className="flex justify-between text-brand-600">
                          <span className="flex items-center gap-1">
                            Service Charge (5%)
                          </span>
                          <span>{formatRupiah(serviceCharge)}</span>
                        </div>
                      )}
                      <div className="h-[1px] bg-brand-200/60 my-2" />
                      <div className="flex justify-between text-brand-900 font-extrabold text-sm md:text-base">
                        <span>Total Pembayaran</span>
                        <span className="text-brand-800">{formatRupiah(total)}</span>
                      </div>
                    </div>

                    {/* Bottom Action Submit Button */}
                    <button
                      type="submit"
                      disabled={!customerName.trim() || (diningOption === 'dine_in' && !tableNumber.trim())}
                      className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all mt-4 ${
                        customerName.trim() && (diningOption !== 'dine_in' || tableNumber.trim())
                          ? 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/10 active:scale-[0.99] hover:translate-y-[-1px]'
                          : 'bg-brand-300 cursor-not-allowed shadow-none'
                      }`}
                      id="checkout-submit-btn"
                    >
                      <span>Lanjut ke Pembayaran</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
