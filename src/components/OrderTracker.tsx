/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, RefreshCw, Smartphone, Receipt, ArrowRight, Printer, ChefHat, Play, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  order: Order | null;
  onNewOrder: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}

export default function OrderTracker({
  order,
  onNewOrder,
  onUpdateStatus,
}: OrderTrackerProps) {
  if (!order) return null;

  const [timeLeft, setTimeLeft] = useState(order.estimatedTimeMinutes * 60); // in seconds
  const [copiedId, setCopiedId] = useState(false);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Live countdown timer simulation
  useEffect(() => {
    if (order.status === 'selesai' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [order.status, timeLeft]);

  // Automated stage transition simulator (gives authentic feeling to the mock tracker)
  useEffect(() => {
    if (order.status === 'selesai') return;

    let nextStatus: OrderStatus | null = null;
    let delay = 10000; // default transition check

    if (order.status === 'pembayaran') {
      nextStatus = 'diproses';
      delay = 1000;
    } else if (order.status === 'diproses') {
      nextStatus = 'diracik';
      delay = 12000;
    } else if (order.status === 'diracik') {
      nextStatus = 'siap';
      delay = 15000;
    }

    if (nextStatus) {
      const timer = setTimeout(() => {
        onUpdateStatus(nextStatus!);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [order.status]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const stages = [
    { id: 'diproses' as OrderStatus, label: 'Diterima', desc: 'Pesanan masuk antrean dapur' },
    { id: 'diracik' as OrderStatus, label: 'Sedang Disiapkan', desc: 'Kopi & hidangan sedang diracik' },
    { id: 'siap' as OrderStatus, label: 'Siap Diambil', desc: 'Silakan ambil pesanan Anda di meja bar' },
    { id: 'selesai' as OrderStatus, label: 'Selesai', desc: 'Nikmati hidangan Anda' },
  ];

  const getStageIndex = (currentStatus: OrderStatus) => {
    if (currentStatus === 'pembayaran') return -1;
    return stages.findIndex((s) => s.id === currentStatus);
  };

  const activeIndex = getStageIndex(order.status);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-8" id="order-tracker-view">
      {/* Tracker Hero Panel */}
      <div className="bg-white rounded-3xl border border-brand-100 shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] bg-brand-100 text-brand-800 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Nomor Meja/Tipe: {order.tableNumber ? `Meja ${order.tableNumber}` : 'Takeaway'}
          </span>
          <h2 className="text-xl md:text-2xl font-extrabold text-brand-900 flex items-center justify-center md:justify-start gap-2">
            <ChefHat className="w-6 h-6 text-brand-600" />
            Pesanan Sedang Diproses
          </h2>
          <p className="text-xs text-brand-500">
            Nama Pelanggan: <span className="text-brand-950 font-bold">{order.customerName}</span>
          </p>
        </div>

        {/* Estimated Countdown timer */}
        {order.status !== 'selesai' ? (
          <div className="bg-brand-50 border border-brand-100 rounded-2xl px-6 py-4 text-center min-w-[150px] shadow-xs">
            <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block mb-1">
              Estimasi Selesai
            </span>
            <div className="font-mono text-2xl font-black text-brand-800 tracking-wider flex items-center justify-center gap-1.5">
              <Clock className="w-5 h-5 text-brand-500 animate-spin" style={{ animationDuration: '6s' }} />
              {formatTime(timeLeft)}
            </div>
            <span className="text-[9px] text-brand-500 mt-1 block">
              Menit : Detik
            </span>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-4 text-center min-w-[150px]">
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mb-1">
              Status Terakhir
            </span>
            <span className="font-extrabold text-emerald-800 text-lg flex items-center justify-center gap-1">
              <CheckCircle2 className="w-5 h-5" />
              Selesai
            </span>
          </div>
        )}
      </div>

      {/* Vertical / Horizontal Progress Steps */}
      <div className="bg-white rounded-3xl border border-brand-100 shadow-xl p-6 md:p-8">
        <h3 className="text-xs font-extrabold text-brand-900 uppercase tracking-wider mb-6 flex items-center justify-between">
          <span>Pelacakan Status Real-Time</span>
          <span className="text-[10px] text-brand-400 font-normal lowercase italic">Simulasi otomatis berjalan</span>
        </h3>

        <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 relative">
          {stages.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            const isUpcoming = idx > activeIndex;

            return (
              <div key={stage.id} className="flex md:flex-col items-start md:items-center gap-4 text-left md:text-center relative">
                {/* Connector line for horizontal view */}
                {idx < stages.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-[60%] right-[-40%] h-[2px] bg-brand-100 z-0">
                    <div
                      className="h-full bg-brand-600 transition-all duration-500"
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}

                {/* Badge Node */}
                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                    isCompleted
                      ? 'bg-brand-600 border-brand-600 text-white'
                      : isActive
                      ? 'bg-amber-100 border-amber-500 text-amber-800 ring-4 ring-amber-100/50 animate-pulse'
                      : 'bg-white border-brand-200 text-brand-400'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                </div>

                {/* Content info */}
                <div className="space-y-0.5">
                  <h4 className={`font-bold text-sm ${isActive ? 'text-amber-800 font-extrabold' : isCompleted ? 'text-brand-900' : 'text-brand-400'}`}>
                    {stage.label}
                  </h4>
                  <p className="text-[11px] text-brand-500 leading-relaxed md:max-w-[140px] md:mx-auto">
                    {stage.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Manual Simulation Controls - Excellent for review! */}
        <div className="mt-8 pt-6 border-t border-brand-100/60 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-brand-500 font-semibold uppercase">
            <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
            <span>Panel Operator Barista (Simulasi):</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {order.status === 'diproses' && (
              <button
                onClick={() => onUpdateStatus('diracik')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-100 hover:bg-brand-200 text-brand-800 font-bold text-[11px] transition-all"
                id="barista-btn-make"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Mulai Racik
              </button>
            )}
            {order.status === 'diracik' && (
              <button
                onClick={() => onUpdateStatus('siap')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-[11px] transition-all"
                id="barista-btn-ready"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Siap Diambil
              </button>
            )}
            {order.status === 'siap' && (
              <button
                onClick={() => onUpdateStatus('selesai')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition-all"
                id="barista-btn-finish"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Selesaikan Pesanan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Digital Receipt Section */}
      <div className="max-w-md mx-auto" id="digital-receipt-section">
        {/* Zig-zag Receipt Card wrapper */}
        <div className="relative bg-white border border-brand-200 rounded-3xl overflow-hidden shadow-xl">
          {/* Top colored aesthetic bar */}
          <div className="h-2 bg-brand-900 w-full" />

          {/* Receipt Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* Cafe Brand Info */}
            <div className="text-center">
              <h4 className="font-black text-brand-900 text-base uppercase tracking-wider">SENJA BREW</h4>
              <p className="text-[10px] text-brand-500 font-medium">JL. RAYA SENJA NO. 45, BANDUNG, INDONESIA</p>
              <div className="h-[1px] border-b border-dashed border-brand-200 my-4" />
            </div>

            {/* Transaction Data */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-brand-600">
                <span>ID Transaksi:</span>
                <span className="font-mono font-bold text-brand-900 flex items-center gap-1">
                  {order.id}
                  <button
                    onClick={handleCopyOrderId}
                    className="text-brand-400 hover:text-brand-700 p-0.5"
                    aria-label="Salin ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <RefreshCw className="w-3 h-3" />}
                  </button>
                </span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Tanggal:</span>
                <span>{new Date(order.createdAt).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Kasir:</span>
                <span>Kasir Mandiri (POS-01)</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Metode Pembayaran:</span>
                <span className="uppercase font-bold text-brand-800">{order.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-brand-600">
                <span>Tipe Pelayanan:</span>
                <span className="font-bold text-brand-800">
                  {order.diningOption === 'dine_in' ? `Makan Di Sini (Meja ${order.tableNumber})` : 'Bawa Pulang (Takeaway)'}
                </span>
              </div>
            </div>

            <div className="h-[1px] border-b border-dashed border-brand-200 my-4" />

            {/* List of Ordered Items */}
            <div className="space-y-3">
              <h5 className="text-[10px] font-extrabold text-brand-900 uppercase tracking-widest">Detail Item</h5>
              <div className="space-y-2.5">
                {order.items.map((item) => {
                  const sizeAdjustment = item.selectedSize === 'Large' ? 5000 : 0;
                  const unitPrice = item.product.price + sizeAdjustment;
                  return (
                    <div key={item.id} className="text-xs">
                      <div className="flex justify-between text-brand-900 font-bold">
                        <span>{item.product.name} x {item.quantity}</span>
                        <span>{formatRupiah(unitPrice * item.quantity)}</span>
                      </div>
                      
                      {/* Specifications */}
                      {(item.selectedSize || item.selectedIce || item.selectedSugar) && (
                        <span className="text-[9px] text-brand-500 block leading-none mt-0.5">
                          [ {item.selectedSize || 'Regular'} • {item.selectedIce === 'No Ice' ? 'Tanpa Es' : 'Normal Es'} • {item.selectedSugar === 'No Sugar' ? 'Tanpa Gula' : 'Normal Gula'} ]
                        </span>
                      )}
                      {item.notes && (
                        <span className="text-[9px] text-amber-700 italic block mt-0.5">
                          Notes: "{item.notes}"
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-[1px] border-b border-dashed border-brand-200 my-4" />

            {/* Financial Summary */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-brand-600">
                <span>Subtotal</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Promo {order.appliedPromo ? `(${order.appliedPromo})` : ''}</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-brand-600">
                <span>PB1 Resto Tax (11%)</span>
                <span>{formatRupiah(order.tax)}</span>
              </div>
              {order.diningOption === 'dine_in' && (
                <div className="flex justify-between text-brand-600">
                  <span>Service Charge (5%)</span>
                  <span>{formatRupiah(order.serviceCharge)}</span>
                </div>
              )}
              <div className="h-[1px] bg-brand-100 my-1.5" />
              <div className="flex justify-between text-brand-950 font-black text-sm md:text-base">
                <span>Total Belanja</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
            </div>

            {/* Mock QR / Barcode */}
            <div className="flex flex-col items-center justify-center pt-4 text-center space-y-2">
              <div className="w-48 h-8 bg-black/5 p-1 rounded-sm flex items-center justify-center overflow-hidden">
                {/* Simulated barcode */}
                <div className="flex gap-[1px] h-full w-full items-stretch">
                  {Array.from({ length: 44 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-brand-900"
                      style={{
                        width: i % 3 === 0 ? '3px' : i % 5 === 0 ? '4px' : '1px',
                        opacity: i % 7 === 0 ? 0 : 0.9,
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[9px] font-mono font-medium text-brand-400">
                SENJA-ORDER-{order.id.slice(0, 8)}
              </span>
            </div>

            <div className="text-center pt-2">
              <p className="text-[10px] text-brand-600 font-semibold leading-relaxed">
                Terima kasih telah berkunjung di Senja Brew!
              </p>
              <p className="text-[9px] text-brand-400">Simpan struk digital ini sebagai bukti pengambilan.</p>
            </div>
          </div>
        </div>

        {/* Buttons to print or place new order */}
        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-brand-200 bg-white text-brand-700 font-bold text-xs hover:bg-brand-50 active:scale-95 transition-all"
            id="print-receipt-btn"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>

          <button
            onClick={onNewOrder}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            id="new-order-btn"
          >
            <span>Pesan Menu Baru</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
