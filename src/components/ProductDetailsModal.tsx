/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Star, Plus, Minus, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, CartItem, CoffeeSize, IceLevel, SugarLevel } from '../types';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailsModalProps) {
  if (!product) return null;

  const isBeverage = product.category === 'kopi' || product.category === 'non-kopi';

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<CoffeeSize>('Regular');
  const [ice, setIce] = useState<IceLevel>('Normal Ice');
  const [sugar, setSugar] = useState<SugarLevel>('Normal Sugar');
  const [notes, setNotes] = useState('');

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const sizePriceAdjustment = size === 'Large' ? 5000 : 0;
  const singleItemPrice = product.price + sizePriceAdjustment;
  const totalPrice = singleItemPrice * quantity;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddClick = () => {
    const cartItem: CartItem = {
      id: `${product.id}-${isBeverage ? `${size}-${ice}-${sugar}` : 'default'}-${Date.now().toString().slice(-4)}`,
      product,
      quantity,
      notes: notes.trim() || undefined,
      selectedSize: isBeverage ? size : undefined,
      selectedIce: isBeverage ? ice : undefined,
      selectedSugar: isBeverage ? sugar : undefined,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] z-10"
          id="product-details-modal"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-xs border border-brand-100 text-brand-700 hover:bg-brand-100 transition-colors"
            aria-label="Tutup"
            id="close-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto flex-grow pb-24">
            {/* Header Image */}
            <div className="relative h-56 bg-brand-50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="bg-brand-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {product.category.replace('-', ' ')}
                </span>
                <h2 className="font-extrabold text-xl md:text-2xl mt-1 text-white shadow-xs">
                  {product.name}
                </h2>
              </div>
            </div>

            {/* Information Body */}
            <div className="p-5 md:p-6 space-y-6">
              {/* Reviews & Description */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="text-sm font-bold text-brand-900 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs text-brand-400 font-medium">• ({product.reviewsCount} Ulasan Pelanggan)</span>
                </div>
                <p className="text-sm text-brand-600 leading-relaxed bg-brand-50/50 p-3.5 rounded-xl border border-brand-100/50">
                  {product.description}
                </p>
              </div>

              {/* Beverage Options Section */}
              {isBeverage && (
                <div className="space-y-4 pt-1">
                  {/* Size Options */}
                  <div>
                    <h4 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                      <span>Ukuran Cup</span>
                      {size === 'Large' && <span className="text-brand-500 text-[10px] font-semibold">+ Rp 5.000</span>}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {(['Regular', 'Large'] as CoffeeSize[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all ${
                            size === s
                              ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                              : 'border-brand-100 bg-white text-brand-600 hover:bg-brand-50/30'
                          }`}
                          id={`size-opt-${s.toLowerCase()}`}
                        >
                          <span>{s === 'Regular' ? 'Regular (350ml)' : 'Large (450ml)'}</span>
                          <span className="text-xs font-semibold text-brand-500">
                            {s === 'Large' ? '+5k' : 'Free'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ice Options */}
                  <div>
                    <h4 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider mb-2.5">
                      Tingkat Es (Ice Level)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Normal Ice', 'Less Ice', 'No Ice'] as IceLevel[]).map((ic) => (
                        <button
                          key={ic}
                          onClick={() => setIce(ic)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                            ice === ic
                              ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                              : 'border-brand-100 bg-white text-brand-600 hover:bg-brand-50/30'
                          }`}
                          id={`ice-opt-${ic.replace(' ', '-').toLowerCase()}`}
                        >
                          {ic === 'Normal Ice' ? 'Normal' : ic === 'Less Ice' ? 'Sedikit' : 'Tanpa Es'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sugar Options */}
                  <div>
                    <h4 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider mb-2.5">
                      Tingkat Kemanisan (Sugar Level)
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Normal Sugar', 'Less Sugar', 'No Sugar'] as SugarLevel[]).map((su) => (
                        <button
                          key={su}
                          onClick={() => setSugar(su)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                            sugar === su
                              ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold'
                              : 'border-brand-100 bg-white text-brand-600 hover:bg-brand-50/30'
                          }`}
                          id={`sugar-opt-${su.replace(' ', '-').toLowerCase()}`}
                        >
                          {su === 'Normal Sugar' ? 'Normal' : su === 'Less Sugar' ? 'Sedikit' : 'Tanpa Gula'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Notes */}
              <div>
                <h4 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Catatan Khusus</span>
                  <span className="text-[10px] text-brand-400 font-normal normal-case">Opsional</span>
                </h4>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tolong kurangi saus karamel, jangan pakai sendok plastik..."
                  rows={2}
                  maxLength={150}
                  className="w-full text-sm border border-brand-100 rounded-xl p-3 bg-white focus:outline-hidden focus:border-brand-400 focus:ring-1 focus:ring-brand-400/50 resize-none text-brand-800"
                  id="product-custom-notes"
                />
                <span className="text-[10px] text-brand-400 text-right block mt-1">
                  {notes.length}/150 karakter
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Checkout Footer */}
          <div className="absolute bottom-0 left-0 right-0 glass border-t border-brand-100 p-4 flex items-center justify-between gap-4 z-10">
            {/* Quantity Selector */}
            <div className="flex items-center bg-brand-100/80 border border-brand-200/50 rounded-xl p-1">
              <button
                onClick={decrementQuantity}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-brand-100 text-brand-800 hover:bg-brand-50 active:scale-95 transition-all"
                aria-label="Kurangi"
                id="modal-qty-minus"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold text-brand-900 text-sm">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-brand-100 text-brand-800 hover:bg-brand-50 active:scale-95 transition-all"
                aria-label="Tambah"
                id="modal-qty-plus"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Total Price & Add to Cart button */}
            <button
              onClick={handleAddClick}
              className="flex-grow flex items-center justify-between bg-brand-600 text-white font-semibold text-sm px-5 py-3.5 rounded-2xl shadow-md shadow-brand-500/20 hover:bg-brand-700 active:scale-98 hover:shadow-lg transition-all"
              id="add-to-cart-confirm"
            >
              <span>Masukkan Keranjang</span>
              <span className="bg-brand-800/80 px-2.5 py-1 rounded-lg text-xs">
                {formatRupiah(totalPrice)}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
