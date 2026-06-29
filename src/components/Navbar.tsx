/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Coffee, ShoppingBag, Clock, FileText } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  activeOrderInProgress: boolean;
  onViewTracker: () => void;
  onViewMenu: () => void;
  currentView: 'menu' | 'tracker' | 'history';
}

export default function Navbar({
  cart,
  onOpenCart,
  activeOrderInProgress,
  onViewTracker,
  onViewMenu,
  currentView,
}: NavbarProps) {
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-brand-100 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={onViewMenu}
          className="flex items-center gap-2.5 cursor-pointer group"
          id="navbar-brand"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:bg-brand-500 transition-colors">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-brand-900 tracking-tight leading-none">SENJA BREW</h1>
            <span className="text-[10px] text-brand-500 font-medium tracking-wider uppercase">Cozy Space & Eatery</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onViewMenu}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              currentView === 'menu' 
                ? 'bg-brand-50 text-brand-700 font-semibold' 
                : 'text-brand-600 hover:text-brand-900 hover:bg-brand-50/50'
            }`}
            id="nav-btn-menu"
          >
            Menu
          </button>

          {activeOrderInProgress && (
            <button
              onClick={onViewTracker}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all animate-pulse ${
                currentView === 'tracker'
                  ? 'bg-amber-100 text-amber-800 font-semibold'
                  : 'bg-brand-100 text-brand-800 hover:bg-brand-200'
              }`}
              id="nav-btn-tracker"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Lacak Pesanan</span>
              <span className="sm:hidden">Lacak</span>
            </button>
          )}

          {/* Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl text-brand-700 hover:bg-brand-50 border border-brand-100/50 transition-all hover:scale-105 active:scale-95"
            aria-label="Buka Keranjang"
            id="nav-btn-cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-600 text-white font-semibold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
