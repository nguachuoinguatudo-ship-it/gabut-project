/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, ChevronRight, RefreshCw, ShoppingCart, Info, Flame, Award, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductDetailsModal from './components/ProductDetailsModal';
import CartSidebar from './components/CartSidebar';
import PaymentGateway from './components/PaymentGateway';
import OrderTracker from './components/OrderTracker';
import { PRODUCTS } from './data/products';
import { Product, CartItem, Order, OrderStatus, DiningOption, PaymentMethodId } from './types';

export default function App() {
  // App States
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('senja_brew_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'payment' | 'tracker'>('menu');
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    const savedOrder = localStorage.getItem('senja_brew_active_order');
    return savedOrder ? JSON.parse(savedOrder) : null;
  });

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast Notifications State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('senja_brew_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeOrder) {
      localStorage.setItem('senja_brew_active_order', JSON.stringify(activeOrder));
    } else {
      localStorage.removeItem('senja_brew_active_order');
    }
  }, [activeOrder]);

  // Toast triggers
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCart((prevCart) => {
      // Find if item with same configuration already exists in cart
      const existingIndex = prevCart.findIndex(
        (item) =>
          item.product.id === newItem.product.id &&
          item.selectedSize === newItem.selectedSize &&
          item.selectedIce === newItem.selectedIce &&
          item.selectedSugar === newItem.selectedSugar &&
          item.notes === newItem.notes
      );

      if (existingIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingIndex].quantity += newItem.quantity;
        return updatedCart;
      }

      return [...prevCart, newItem];
    });

    showToast(`☕ ${newItem.product.name} berhasil dimasukkan ke keranjang!`);
  };

  const handleUpdateQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    const item = cart.find((i) => i.id === itemId);
    setCart((prevCart) => prevCart.filter((i) => i.id !== itemId));
    if (item) {
      showToast(`🗑️ ${item.product.name} dihapus dari keranjang.`);
    }
  };

  // Checkout confirmation
  const handleConfirmOrder = (orderData: {
    customerName: string;
    diningOption: DiningOption;
    tableNumber?: string;
    appliedPromo?: string;
    discountAmount: number;
    subtotal: number;
    tax: number;
    serviceCharge: number;
    total: number;
  }) => {
    // Generate order object
    const newOrder: Order = {
      id: `SB-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart,
      subtotal: orderData.subtotal,
      discount: orderData.discountAmount,
      tax: orderData.tax,
      serviceCharge: orderData.serviceCharge,
      total: orderData.total,
      diningOption: orderData.diningOption,
      paymentMethod: 'qris', // Default choice placeholder, updated on gateway
      status: 'pembayaran',
      createdAt: new Date().toISOString(),
      estimatedTimeMinutes: Math.floor(8 + Math.random() * 12), // 8 - 20 minutes
      customerName: orderData.customerName,
      tableNumber: orderData.tableNumber,
      appliedPromo: orderData.appliedPromo,
    };

    setActiveOrder(newOrder);
    setIsCartOpen(false);
    setCurrentView('payment');
  };

  // Payment successful trigger
  const handlePaymentSuccess = (paymentMethod: PaymentMethodId) => {
    if (!activeOrder) return;
    
    const updatedOrder: Order = {
      ...activeOrder,
      paymentMethod,
      status: 'diproses',
    };

    setActiveOrder(updatedOrder);
    setCart([]); // Clear cart
    setCurrentView('tracker');
    showToast('🎉 Pembayaran berhasil diverifikasi! Pesanan sedang diproses.');
  };

  const handleUpdateOrderStatus = (newStatus: OrderStatus) => {
    if (!activeOrder) return;
    const updatedOrder = { ...activeOrder, status: newStatus };
    setActiveOrder(updatedOrder);
    
    if (newStatus === 'diracik') {
      showToast('☕ Barista kami sedang meracik kopi dan hidangan Anda.');
    } else if (newStatus === 'siap') {
      showToast('🔔 Hore! Pesanan Anda sudah siap diambil di bar meja barista.');
    } else if (newStatus === 'selesai') {
      showToast('😋 Selamat menikmati! Terima kasih telah memesan.');
    }
  };

  const handleNewOrder = () => {
    setActiveOrder(null);
    setCurrentView('menu');
  };

  // Categories helper list
  const categories = [
    { id: 'semua', label: 'Semua Menu' },
    { id: 'kopi', label: 'Kopi Susu' },
    { id: 'non-kopi', label: 'Matcha & Teh' },
    { id: 'makanan-berat', label: 'Makanan Utama' },
    { id: 'cemilan', label: 'Snacks / Croissant' },
    { id: 'pencuci-mulut', label: 'Desserts' },
  ];

  // Filtering Logic
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = selectedCategory === 'semua' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-brand-50/40 text-brand-900 font-sans flex flex-col selection:bg-brand-200 selection:text-brand-900" id="app-root-container">
      {/* Top Banner Disclaimer */}
      <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-xs font-bold border-b border-amber-600 flex items-center justify-center gap-1.5 shadow-inner" id="disclaimer-banner">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-950 animate-pulse" />
        <span>Situs ini adalah <strong>Situs Simulasi Pemesanan</strong>. Transaksi bersifat fiktif & tidak menuntut pembayaran riil.</span>
      </div>

      {/* Main Navbar */}
      <Navbar
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        activeOrderInProgress={!!activeOrder && activeOrder.status !== 'pembayaran'}
        onViewTracker={() => setCurrentView('tracker')}
        onViewMenu={() => setCurrentView('menu')}
        currentView={currentView}
      />

      {/* Dynamic Views */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {currentView === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto px-4 py-6 md:py-10 space-y-8"
              id="menu-view-section"
            >
              {/* Promo Banner / Hero Card */}
              <div className="relative bg-gradient-to-br from-brand-900 to-brand-800 text-white rounded-3xl p-6 md:p-10 overflow-hidden shadow-xl" id="hero-promo-banner">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none hidden md:block">
                  <div className="w-full h-full bg-[radial-gradient(#debfa0_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>

                <div className="relative space-y-4 max-w-2xl">
                  <span className="inline-flex items-center gap-1 bg-brand-700/80 text-brand-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-brand-300 animate-spin" style={{ animationDuration: '4s' }} />
                    PROMO PEMBUKAAN CAFE
                  </span>
                  
                  <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Nikmati Cita Rasa Kopi Senja Murni di Gadget Anda
                  </h2>
                  
                  <p className="text-xs md:text-sm text-brand-100 leading-relaxed max-w-lg font-medium">
                    Pesan melalui aplikasi simulasi kami, dapatkan voucher potongan langsung hingga 30% dengan kupon <code className="bg-brand-950 px-1.5 py-0.5 rounded text-brand-300 font-bold font-mono">SENJABARU</code>.
                  </p>
                </div>
              </div>

              {/* Filtering & Searching Controls */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-brand-950 text-xl tracking-tight flex items-center gap-2">
                      <Flame className="w-5 h-5 text-brand-600 animate-pulse" />
                      Jelajahi Menu Istimewa
                    </h3>
                    <p className="text-xs text-brand-500">Pilih hidangan peneman produktivitas Anda hari ini.</p>
                  </div>

                  {/* Search input with icons */}
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kopi, croissant, spaghetti..."
                      className="w-full text-xs border border-brand-100 rounded-xl pl-10 pr-4 py-3 bg-white focus:outline-hidden focus:border-brand-500 shadow-2xs text-brand-800"
                      id="menu-search-bar"
                    />
                  </div>
                </div>

                {/* Horizontal Category Pill Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none" id="category-filter-bar">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-brand-600 text-white border-brand-600 font-bold shadow-md shadow-brand-500/10'
                          : 'bg-white text-brand-600 border-brand-100/80 hover:bg-brand-50'
                      }`}
                      id={`cat-filter-btn-${cat.id}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid of Product Cards */}
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-brand-100">
                  <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-400 mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-brand-900 text-base">Menu Tidak Ditemukan</h4>
                  <p className="text-xs text-brand-500 max-w-xs mx-auto">
                    Maaf, menu dengan kata kunci "{searchQuery}" tidak tersedia di kategori ini.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" id="products-catalog-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectProduct={(prod) => setSelectedProduct(prod)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {currentView === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PaymentGateway
                totalAmount={activeOrder?.total || 0}
                customerName={activeOrder?.customerName || ''}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => {
                  setCurrentView('menu');
                  setIsCartOpen(true);
                }}
              />
            </motion.div>
          )}

          {currentView === 'tracker' && (
            <motion.div
              key="tracker"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <OrderTracker
                order={activeOrder}
                onNewOrder={handleNewOrder}
                onUpdateStatus={handleUpdateOrderStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Bottom Cart Bar for Quick Access on Mobile */}
      {cart.length > 0 && currentView === 'menu' && (
        <div className="sticky bottom-4 mx-auto w-[90%] max-w-md z-40" id="floating-cart-bar">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-brand-900 text-white font-bold text-sm px-5 py-4 rounded-2xl flex items-center justify-between shadow-2xl hover:bg-brand-800 transition-all hover:translate-y-[-2px] active:translate-y-[1px]"
          >
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-4.5 h-4.5 animate-bounce" />
              <span>
                {cart.reduce((s, i) => s + i.quantity, 0)} Item di Keranjang
              </span>
            </div>
            <div className="flex items-center gap-1 bg-brand-700/80 px-3 py-1 rounded-lg text-xs">
              <span>Buka</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>
      )}

      {/* Modular Drawers / Modal Windows */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onConfirmOrder={handleConfirmOrder}
      />

      {/* Absolute Toast Notifications popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm"
            id="toast-notification"
          >
            <div className="bg-brand-950 text-white border border-brand-800 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
              <span className="text-sm font-semibold">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer copyright */}
      <footer className="bg-brand-900/10 border-t border-brand-200/40 py-6 text-center text-xs text-brand-500" id="footer-credits">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5">
          <p>© 2026 Senja Brew & Co. Crafted with 🤎 in Bandung.</p>
          <p className="text-[10px] text-brand-400">Aplikasi ini murni simulator digital. Tidak melayani pengiriman produk kopi fisik nyata.</p>
        </div>
      </footer>
    </div>
  );
}
