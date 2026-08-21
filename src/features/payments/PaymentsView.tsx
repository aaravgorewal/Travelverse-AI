import React, { useState } from "react";
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  DollarSign,
  ArrowRight,
  Split,
  Layers,
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { paymentService } from "../../services";
import { Booking } from "../../types";
import { Button, Card, Badge, Input } from "../../components/ui";
import { formatCurrency, generateBookingRef } from "../../lib/utils";

export const PaymentsView: React.FC = () => {
  const { checkoutItem, currency, addBooking, clearCheckout } = useTravelStore();
  const { setModule } = useUIStore();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple_pay" | "crypto" | "split">("card");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCVC, setCardCVC] = useState("888");
  const [cardName, setCardName] = useState("Elena Rostova");

  // Split-Pay feature state
  const [splitCount, setSplitCount] = useState(2);
  const [splitEmails, setSplitEmails] = useState(["traveler2@example.com"]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  if (!checkoutItem) {
    return (
      <div className="text-center py-24 space-y-4">
        <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold">No booking currently selected for payment</h2>
        <Button onClick={() => setModule("home")}>Browse Travel Catalog</Button>
      </div>
    );
  }

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const result = await paymentService.processPayment({
        amount: checkoutItem.totalPrice,
        currency,
        method: paymentMethod,
      });

      // Save confirmed booking in global store
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        referenceNumber: generateBookingRef("TV"),
        referenceCode: generateBookingRef("TV"),
        type: checkoutItem.type,
        title: (checkoutItem.item as any).title || (checkoutItem.item as any).name || (checkoutItem.item as any).airline || "Travel Reservation",
        destination: (checkoutItem.item as any).destination || (checkoutItem.item as any).city || "Global",
        itemDetails: checkoutItem.item,
        status: "confirmed",
        totalAmount: checkoutItem.totalPrice,
        totalPrice: checkoutItem.totalPrice,
        currency,
        travelersCount: checkoutItem.travelers,
        travelDate: checkoutItem.dates.start,
        bookingDate: new Date().toISOString(),
        dates: checkoutItem.dates,
        createdAt: new Date().toISOString(),
        paymentMethod,
        paymentStatus: "paid",
        voucherUrl: "#",
      };

      addBooking(newBooking);
      setPaymentSuccess(result);
      clearCheckout();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const splitShare = checkoutItem.totalPrice / splitCount;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">PCI-DSS Level 1 Escrow Vault</Badge>
            <span className="text-xs text-slate-400 font-semibold">256-Bit TLS Bank Encrypted</span>
          </div>
          <h1 className="text-2xl font-black mt-1">Secure Checkout & Smart Split-Pay</h1>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span>Money-Back Flight Guarantee</span>
        </div>
      </div>

      {!paymentSuccess ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Method Selector */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Select Payment Flow</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "card", label: "Credit Card", icon: "💳" },
                  { id: "apple_pay", label: "Apple / GPay", icon: "⚡" },
                  { id: "split", label: "Split With Crew", icon: "👥" },
                  { id: "crypto", label: "USDC / Crypto", icon: "🌐" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === m.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-md scale-102"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Split-Pay Section */}
              {paymentMethod === "split" && (
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 dark:text-indigo-200">Split payment among travelers:</span>
                    <Badge variant="purple">{splitCount} People</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="2"
                      max="6"
                      value={splitCount}
                      onChange={(e) => setSplitCount(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(splitShare, currency)} / person
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Each buddy receives a direct payment link via email with 48 hours to complete their portion.
                  </p>
                </div>
              )}

              {/* Card Inputs */}
              <form onSubmit={handleProcessPayment} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Name on Card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Security CVC</label>
                    <input
                      type="password"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      maxLength={4}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-xl"
                  isLoading={isProcessing}
                >
                  <Lock className="w-4 h-4 mr-1.5" />
                  <span>
                    Pay {formatCurrency(paymentMethod === "split" ? splitShare : checkoutItem.totalPrice, currency)} & Confirm Booking
                  </span>
                </Button>
              </form>
            </Card>
          </div>

          {/* Right Col: Order Summary */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</h3>

              <div className="space-y-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                  {checkoutItem.type.toUpperCase()} BOOKING
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {(checkoutItem.item as any).title || (checkoutItem.item as any).name || (checkoutItem.item as any).airline}
                </h4>
                <p className="text-xs text-slate-500">
                  Travelers: {checkoutItem.travelers} • Dates: {checkoutItem.dates.start}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Base Fare</span>
                  <span>{formatCurrency(checkoutItem.totalPrice * 0.88, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxes & Airport Surcharges</span>
                  <span>{formatCurrency(checkoutItem.totalPrice * 0.12, currency)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Carbon Offset Contribution</span>
                  <span>Included ($0.00)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className="text-sm font-bold">Grand Total</span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {formatCurrency(checkoutItem.totalPrice, currency)}
                </span>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Payment Success Confirmation */
        <Card className="p-8 sm:p-12 text-center space-y-6 animate-in zoom-in-95">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto shadow-xl">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge variant="success" size="md">Transaction Approved</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Your Booking is Confirmed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Receipt reference <strong>#{paymentSuccess.transactionId}</strong> has been transmitted to your email and added to your Digital Travel Wallet.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" onClick={() => setModule("bookings")}>
              View My Bookings
            </Button>
            <Button onClick={() => setModule("documents")}>
              Open Digital Wallet
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
