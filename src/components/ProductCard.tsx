/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onSelectProduct: (product: Product) => void;
}

export default function ProductCard({ product, onSelectProduct }: ProductCardProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-xs hover:shadow-lg hover:border-brand-200 transition-all flex flex-col h-full ${
        !product.isAvailable ? 'opacity-75' : ''
      }`}
      id={`product-card-${product.id}`}
    >
      {/* Product Image */}
      <div className="relative aspect-video overflow-hidden bg-brand-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Availability Overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-brand-900/90 text-brand-100 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              Stok Habis
            </span>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && product.isAvailable && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="bg-brand-900/80 text-brand-100 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs uppercase tracking-wider"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating badge */}
        {product.isAvailable && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-xs border border-brand-100">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span className="text-[11px] font-bold text-brand-900">{product.rating}</span>
            <span className="text-[9px] text-brand-500">({product.reviewsCount})</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-1 text-[11px] text-brand-500 font-semibold uppercase tracking-wider">
          {product.category.replace('-', ' ')}
        </div>
        
        <h3 className="font-bold text-brand-900 text-base mb-1.5 group-hover:text-brand-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        
        <p className="text-xs text-brand-600 leading-relaxed line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        {/* Footer with Price and Button */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-100/60 mt-auto">
          <div>
            <span className="text-[10px] text-brand-400 block font-medium uppercase leading-none mb-1">Harga</span>
            <span className="font-bold text-brand-800 text-base md:text-lg">
              {formatRupiah(product.price)}
            </span>
          </div>

          <button
            onClick={() => product.isAvailable && onSelectProduct(product)}
            disabled={!product.isAvailable}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              product.isAvailable
                ? 'bg-brand-600 text-white hover:bg-brand-700 hover:scale-[1.03] active:scale-[0.97]'
                : 'bg-brand-100 text-brand-400 cursor-not-allowed'
            }`}
            id={`add-btn-${product.id}`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Tambah
          </button>
        </div>
      </div>
    </motion.div>
  );
}
