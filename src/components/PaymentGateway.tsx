/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Copy, Check, Smartphone, QrCode, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { PaymentMethodId } from '../types';

interface PaymentGatewayProps {
  totalAmount: number;
  customerName: string;
  onPaymentSuccess: (method: PaymentMethodId) => void;
  onCancel: () => void;
}

export default function PaymentGateway({
  totalAmount,
  customerName,
  onPaymentSuccess,
  onCancel,
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('qris');
  const [copied, setCopied] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
  const [processLogs, setProcessLogs] = useState<string[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const paymentMethods = [
    { id: 'qris' as PaymentMethodId, name: 'QRIS (Gopay/OVO/Dana/LinkAja)', subtitle: 'Scan kode QR instan', badge: 'Tercepat' },
    { id: 'gopay' as PaymentMethodId, name: 'GoPay', subtitle: 'Potongan otomatis via saldo GoPay' },
    { id: 'ovo' as PaymentMethodId, name: 'OVO Cash', subtitle: 'Konfirmasi push-notification ponsel' },
    { id: 'shopeepay' as PaymentMethodId, name: 'ShopeePay', subtitle: 'Buka aplikasi Shopee untuk bayar' },
    { id: 'transfer_bank' as PaymentMethodId, name: 'Virtual Account Bank', subtitle: 'BCA / Mandiri / BNI / BRI' },
  ];

  const logs = [
    'Membuat token transaksi aman...',
    `Menghubungkan ke server ${selectedMethod.toUpperCase()}...`,
    'Menunggu pembayaran dari pelanggan...',
    'Dana diterima! Memverifikasi tanda tangan digital...',
    'Mengonfirmasi pesanan ke sistem POS Barista...',
    'Transaksi berhasil divalidasi!',
  ];

  const handleCopyVa = () => {
    navigator.clipboard.writeText('8801202606294537');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaySimulation = () => {
    setStep('processing');
    setProcessLogs([logs[0]]);
    setCurrentLogIndex(0);
  };

  useEffect(() => {
    if (step !== 'processing') return;

    if (currentLogIndex < logs.length - 1) {
      const timeout = setTimeout(() => {
        const nextIndex = currentLogIndex + 1;
        setCurrentLogIndex(nextIndex);
        setProcessLogs((prev) => [...prev, logs[nextIndex]]);
      }, 1500);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setStep('success');
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [step, currentLogIndex]);

  useEffect(() => {
    if (step === 'success') {
      const timeout = setTimeout(() => {
        onPaymentSuccess(selectedMethod);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12" id="payment-gateway-container">
      {step === 'selection' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-brand-100 shadow-xl overflow-hidden"
        >
          {/* Top Info Bar */}
          <div className="bg-brand-900 text-white p-6 md:p-8 relative">
            <button
              onClick={onCancel}
              className="absolute top-6 left-6 text-brand-300 hover:text-white flex items-center gap-1 text-xs font-semibold"
              id="back-to-cart-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>

            <div className="text-center pt-4">
              <span className="text-[10px] text-brand-300 font-bold uppercase tracking-widest block mb-1">
                Gerbang Pembayaran Aman (Simulasi)
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                {formatRupiah(totalAmount)}
              </h2>
              <p className="text-xs text-brand-200 mt-1.5 font-medium">
                Atas Nama: <span className="text-white font-bold">{customerName}</span>
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold text-brand-900 uppercase tracking-wider mb-3">
                Pilih Metode Pembayaran
              </h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      selectedMethod === method.id
                        ? 'border-brand-600 bg-brand-50/50 shadow-sm ring-1 ring-brand-600/30'
                        : 'border-brand-100 hover:bg-brand-50/20'
                    }`}
                    id={`pay-method-${method.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        selectedMethod === method.id ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-600'
                      }`}>
                        {method.id === 'qris' ? (
                          <QrCode className="w-5 h-5" />
                        ) : method.id === 'transfer_bank' ? (
                          <CreditCard className="w-5 h-5" />
                        ) : (
                          <Smartphone className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-brand-900 text-sm block">
                          {method.name}
                        </span>
                        <span className="text-xs text-brand-500 font-medium">
                          {method.subtitle}
                        </span>
                      </div>
                    </div>

                    {method.badge && (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {method.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Simulated QRIS / Input fields based on selection */}
            <div className="bg-brand-50/80 border border-brand-100 rounded-2xl p-5">
              {selectedMethod === 'qris' && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <span className="text-[10px] bg-brand-800 text-white font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    QRIS GPN Standar Indonesia
                  </span>
                  
                  {/* Mock QR Code */}
                  <div className="bg-white p-4 rounded-2xl border border-brand-200 shadow-inner w-44 h-44 flex items-center justify-center relative group">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SENJABREWCOFFEEORDER-PREVIEW"
                      alt="Mock QRIS"
                      className="w-full h-full opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-white/20 flex items-center justify-center pointer-events-none" />
                  </div>

                  <p className="text-xs text-brand-600 max-w-sm">
                    Gunakan aplikasi GoPay, OVO, ShopeePay, LinkAja, DANA, atau M-Banking Anda untuk memindai kode QR simulasi di atas.
                  </p>
                </div>
              )}

              {['gopay', 'ovo', 'shopeepay'].includes(selectedMethod) && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold text-brand-700 uppercase tracking-wider">
                    Nomor Handphone Terdaftar
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-500">
                      +62
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="81234567890"
                      className="w-full text-sm border border-brand-100 rounded-xl pl-14 pr-4 py-3 bg-white focus:outline-hidden focus:border-brand-500 text-brand-800"
                      id="payment-phone-input"
                    />
                  </div>
                  <p className="text-[10px] text-brand-500 italic">
                    Konfirmasi pembayaran akan dikirimkan langsung ke aplikasi dompet digital Anda secara otomatis.
                  </p>
                </div>
              )}

              {selectedMethod === 'transfer_bank' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-400 font-bold uppercase block">Bank Tujuan</span>
                      <span className="text-sm font-bold text-brand-900">BCA Virtual Account</span>
                    </div>
                    <span className="bg-brand-900 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md">BCA</span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-brand-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-brand-400 font-semibold block">Nomor Virtual Account</span>
                      <span className="font-mono font-bold text-brand-800 text-sm tracking-wider">
                        8801202606294537
                      </span>
                    </div>
                    <button
                      onClick={handleCopyVa}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 px-2.5 py-1.5 rounded-lg border border-brand-100 active:scale-95 transition-all"
                      id="copy-va-btn"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-brand-500 leading-relaxed">
                    Sistem kami mendeteksi transfer secara otomatis setelah pembayaran sukses diproses. Tidak diperlukan bukti transfer fisik.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Launcher Button */}
            <button
              onClick={handlePaySimulation}
              disabled={['gopay', 'ovo', 'shopeepay'].includes(selectedMethod) && phoneNumber.length < 9}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white shadow-lg transition-all ${
                !['gopay', 'ovo', 'shopeepay'].includes(selectedMethod) || phoneNumber.length >= 9
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/10 active:scale-[0.99] hover:translate-y-[-1px]'
                  : 'bg-brand-300 cursor-not-allowed shadow-none'
              }`}
              id="confirm-pay-simulation-btn"
            >
              <span>Bayar {formatRupiah(totalAmount)} (Simulasi)</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Processing State with Animated Logs */}
      {step === 'processing' && (
        <div className="bg-white rounded-3xl border border-brand-100 shadow-xl p-8 text-center space-y-6" id="payment-processing-stage">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-600">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <h3 className="font-bold text-brand-900 text-lg">Memproses Pembayaran</h3>
            <p className="text-xs text-brand-500 mt-1">Harap tidak menutup halaman ini selama sistem bekerja.</p>
          </div>

          {/* Simulated terminal console */}
          <div className="bg-brand-900 text-emerald-400 rounded-2xl p-4 font-mono text-[11px] text-left space-y-1.5 shadow-inner max-h-48 overflow-y-auto">
            {processLogs.map((log, index) => (
              <div key={index} className="flex items-start gap-1.5">
                <span className="text-brand-500">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {step === 'success' && (
        <div className="bg-white rounded-3xl border border-brand-100 shadow-xl p-8 text-center space-y-4" id="payment-success-stage">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>

          <div>
            <h3 className="font-extrabold text-brand-900 text-xl">Pembayaran Berhasil!</h3>
            <p className="text-sm text-brand-600 mt-1">
              Terima kasih, pembayaran sebesar <strong>{formatRupiah(totalAmount)}</strong> telah divalidasi.
            </p>
          </div>

          <p className="text-xs text-brand-400 mt-4 animate-pulse">
            Membuka lembar pelacakan pesanan Anda...
          </p>
        </div>
      )}
    </div>
  );
}
