import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  CreditCard, ShieldCheck, CheckCircle2, User, Package, Users, 
  FileText, Lock, ArrowRight, Loader2, XCircle
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { paymentService, analyticsService } from "../../services";
import { Booking } from "../../types";
import { Button, Card, Badge, Input } from "../../components/ui";
import { formatCurrency, generateBookingRef } from "../../lib/utils";
import { bookingFormSchema, BookingFormValues } from "./bookingSchemas";

const STEPS = [
  { id: 1, name: "Customer", icon: <User className="w-4 h-4" /> },
  { id: 2, name: "Products", icon: <Package className="w-4 h-4" /> },
  { id: 3, name: "Travelers", icon: <Users className="w-4 h-4" /> },
  { id: 4, name: "Review", icon: <FileText className="w-4 h-4" /> },
  { id: 5, name: "Payment", icon: <CreditCard className="w-4 h-4" /> },
  { id: 6, name: "Status", icon: <CheckCircle2 className="w-4 h-4" /> }
];

export const PaymentsView: React.FC = () => {
  const { checkoutItem, currency, addBooking, clearCheckout } = useTravelStore();
  const { setModule } = useUIStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingStatus, setBookingStatus] = useState<"idle" | "pending" | "confirmed" | "failed" | "cancelled">("idle");
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [showGateway, setShowGateway] = useState(false);
  
  const { register, control, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerEmail: "elena.rostova@travelverse.ai",
      customerPhone: "+14158923310",
      travelers: Array(checkoutItem?.travelers || 1).fill({ firstName: "", lastName: "", dob: "", passportId: "", frequentFlyer: "" }),
      paymentProvider: "stripe",
    },
    mode: "onChange"
  });

  const { fields: travelerFields } = useFieldArray({ control, name: "travelers" });
  const paymentProvider = watch("paymentProvider");

  useEffect(() => {
    analyticsService.trackEvent("booking_started", {
      type: checkoutItem?.type || "unknown",
      totalPrice: checkoutItem?.totalPrice || 0
    });
  }, []);

  useEffect(() => {
    if (checkoutItem && travelerFields.length !== checkoutItem.travelers) {
      // Re-initialize traveler array if store changes
      const newTravelers = Array(checkoutItem.travelers).fill({ firstName: "", lastName: "", dob: "", passportId: "", frequentFlyer: "" });
      setValue("travelers", newTravelers);
    }
  }, [checkoutItem, travelerFields.length, setValue]);

  if (!checkoutItem) {
    return (
      <div className="text-center py-24 space-y-4">
        <CreditCard className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold">No booking currently selected for payment</h2>
        <Button onClick={() => setModule("home")}>Browse Travel Catalog</Button>
      </div>
    );
  }

  const handleNextStep = async () => {
    let isValid = false;
    
    // Validate current step fields before advancing
    if (currentStep === 1) {
      isValid = await trigger(["customerEmail", "customerPhone"]);
    } else if (currentStep === 2) {
      isValid = true; // Review step
    } else if (currentStep === 3) {
      isValid = await trigger(["travelers"]);
    } else if (currentStep === 4) {
      isValid = true; // Review step
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (currentStep !== 5) return;
    
    // Instead of processing immediately, open the provider-agnostic gateway overlay
    setShowGateway(true);
  };

  const handleGatewaySuccess = async () => {
    setShowGateway(false);
    setBookingStatus("pending");
    setCurrentStep(6);
    
    try {
      // Provider agnostic processing
      const data = watch();
      const result = await paymentService.processPayment({
        amount: checkoutItem.totalPrice,
        currency,
        method: data.paymentProvider as any,
      });

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
        paymentMethod: data.paymentProvider,
        paymentStatus: "paid",
        voucherUrl: "#",
      };

      addBooking(newBooking);
      analyticsService.trackEvent("booking_completed", { 
        reference: newBooking.referenceNumber, 
        totalAmount: newBooking.totalAmount 
      });
      setBookingResult({ ...result, reference: newBooking.referenceNumber });
      setBookingStatus("confirmed");
      clearCheckout();
    } catch (err: any) {
      setBookingResult({ error: err.message || "Unknown error occurred" });
      setBookingStatus("failed");
    }
  };

  const handleGatewayCancel = () => {
    setShowGateway(false);
    setBookingStatus("cancelled");
    setCurrentStep(6);
  };

  const renderStepper = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 custom-scrollbar">
      {STEPS.map((step, idx) => (
        <div key={step.id} className="flex items-center flex-shrink-0">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold transition-colors ${
            currentStep > step.id ? "bg-emerald-500 border-emerald-500 text-white" :
            currentStep === step.id ? "bg-indigo-600 border-indigo-600 text-white" :
            "bg-slate-100 border-slate-300 text-slate-400 dark:bg-slate-800 dark:border-slate-700"
          }`}>
            {currentStep > step.id ? <CheckCircle2 className="w-4 h-4" /> : step.id}
          </div>
          <span className={`ml-2 text-xs font-bold ${currentStep === step.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500"}`}>
            {step.name}
          </span>
          {idx < STEPS.length - 1 && (
            <div className={`w-8 sm:w-16 h-1 mx-2 sm:mx-4 rounded-full ${currentStep > step.id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-20">
      
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <Badge variant="success">Secure Global Booking</Badge>
          <h1 className="text-2xl font-black mt-2">Checkout & Reservation</h1>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-950/40 px-3.5 py-1.5 rounded-xl border border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" /> 256-Bit TLS Secured
        </div>
      </div>

      {renderStepper()}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Step 1: Customer */}
        {currentStep === 1 && (
          <Card className="p-6 space-y-4 animate-in slide-in-from-right-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><User className="w-5 h-5 text-indigo-500"/> Lead Customer Contact</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Email Address</label>
                <Input {...register("customerEmail")} placeholder="email@example.com" />
                {errors.customerEmail && <p className="text-red-500 text-xs mt-1">{errors.customerEmail.message}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">Phone Number</label>
                <Input {...register("customerPhone")} placeholder="+1 (555) 000-0000" />
                {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="button" onClick={handleNextStep}>Continue <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </Card>
        )}

        {/* Step 2: Products */}
        {currentStep === 2 && (
          <Card className="p-6 space-y-4 animate-in slide-in-from-right-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><Package className="w-5 h-5 text-indigo-500"/> Selected Products</h2>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1 block">{checkoutItem.type}</span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {(checkoutItem.item as any).title || (checkoutItem.item as any).name || (checkoutItem.item as any).airline}
              </h3>
              <p className="text-sm text-slate-500 mt-2">Dates: {checkoutItem.dates.start}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-bold text-slate-700 dark:text-slate-300">Total for {checkoutItem.travelers} Traveler(s)</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{formatCurrency(checkoutItem.totalPrice, currency)}</span>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
              <Button type="button" onClick={handleNextStep}>Confirm Products <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </Card>
        )}

        {/* Step 3: Travelers */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <h2 className="text-lg font-bold flex items-center gap-2 px-1"><Users className="w-5 h-5 text-indigo-500"/> Traveler Information</h2>
            {travelerFields.map((field, index) => (
              <Card key={field.id} className="p-6">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                  Traveler {index + 1} {index === 0 ? "(Lead)" : ""}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">First Name</label>
                    <Input {...register(`travelers.${index}.firstName`)} />
                    {errors.travelers?.[index]?.firstName && <p className="text-red-500 text-xs mt-1">{errors.travelers[index]?.firstName?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Last Name</label>
                    <Input {...register(`travelers.${index}.lastName`)} />
                    {errors.travelers?.[index]?.lastName && <p className="text-red-500 text-xs mt-1">{errors.travelers[index]?.lastName?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Date of Birth</label>
                    <Input type="date" {...register(`travelers.${index}.dob`)} />
                    {errors.travelers?.[index]?.dob && <p className="text-red-500 text-xs mt-1">{errors.travelers[index]?.dob?.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 mb-1 block">Passport ID (Optional)</label>
                    <Input {...register(`travelers.${index}.passportId`)} />
                  </div>
                </div>
              </Card>
            ))}
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>Back</Button>
              <Button type="button" onClick={handleNextStep}>Review Details <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <Card className="p-6 space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-lg font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500"/> Review & Policies</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Contact</span>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{watch("customerEmail")} • {watch("customerPhone")}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase">Travelers</span>
                  <ul className="text-sm font-semibold text-slate-700 dark:text-slate-300 list-disc pl-4 space-y-1">
                    {watch("travelers").map((t: any, i: number) => <li key={i}>{t.firstName} {t.lastName}</li>)}
                  </ul>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">
                <span className="text-xs font-bold text-slate-400 block uppercase mb-2">Cancellation Policy</span>
                <p className="text-slate-600 dark:text-slate-400 mb-2">Free cancellation within 24 hours of booking. Non-refundable after that.</p>
                <div className="flex items-center gap-2 mt-4 text-emerald-600 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" /> You are protected by our global guarantee.
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>Back</Button>
              <Button type="button" onClick={handleNextStep}>Proceed to Payment <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </Card>
        )}

        {/* Step 5: Provider-Agnostic Payment UI */}
        {currentStep === 5 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-right-4">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Select Payment Gateway</h3>
                  <Badge variant="success">PCI-DSS Compliant</Badge>
                </div>
                
                <p className="text-xs text-slate-500 mb-4">
                  You will be securely redirected to the selected provider. We never store or handle your raw credit card data.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {[
                    { id: "stripe", label: "Stripe Checkout", desc: "Credit Cards, Apple Pay, Google Pay" },
                    { id: "razorpay", label: "Razorpay", desc: "UPI, Cards, Netbanking (India)" },
                  ].map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setValue("paymentProvider", m.id as any)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        paymentProvider === m.id
                          ? "bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-400 shadow-md ring-1 ring-indigo-500"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{m.label}</span>
                        {paymentProvider === m.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex gap-3">
                  <Lock className="w-5 h-5 shrink-0" />
                  <p>
                    By clicking "Pay Securely", you will open the <strong>{paymentProvider === "stripe" ? "Stripe" : "Razorpay"}</strong> secure overlay. 
                  </p>
                </div>

                <div className="flex justify-between pt-6">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(4)}>Back to Review</Button>
                  <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Lock className="w-4 h-4 mr-2" /> Pay Securely via {paymentProvider === "stripe" ? "Stripe" : "Razorpay"}
                  </Button>
                </div>
              </Card>
            </div>
            
            {/* Enhanced Order Summary Right Col */}
            <div className="space-y-6">
              <Card className="p-6 space-y-4 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Summary</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(checkoutItem.totalPrice * 0.88, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Taxes (VAT/GST)</span>
                    <span>{formatCurrency(checkoutItem.totalPrice * 0.08, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Provider Fees</span>
                    <span>{formatCurrency(checkoutItem.totalPrice * 0.04, currency)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Bundle Discount</span>
                    <span>- {formatCurrency(0, currency)}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-sm font-bold">Total to Pay</span>
                  <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(checkoutItem.totalPrice, currency)}</span>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation Status */}
        {currentStep === 6 && (
          <Card className="p-12 text-center max-w-xl mx-auto space-y-6 animate-in zoom-in-95">
            {bookingStatus === "pending" && (
              <div className="flex flex-col items-center text-indigo-500 space-y-4">
                <Loader2 className="w-16 h-16 animate-spin" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Connecting to Backend API...</h2>
                <p className="text-sm text-slate-500">Please do not refresh this page while we secure your inventory.</p>
              </div>
            )}
            
            {bookingStatus === "confirmed" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <Badge variant="success">Booking Confirmed</Badge>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Success!</h2>
                <p className="text-sm text-slate-500">Your reservation has been secured. Reference Number: <strong className="text-slate-900 dark:text-white">{bookingResult?.reference}</strong></p>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setModule("bookings")}>View Bookings</Button>
                  <Button type="button" onClick={() => setModule("documents")}>View Tickets</Button>
                </div>
              </div>
            )}

            {bookingStatus === "failed" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 flex items-center justify-center">
                  <XCircle className="w-10 h-10" />
                </div>
                <Badge variant="danger">Booking Failed</Badge>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Transaction Declined</h2>
                <p className="text-sm text-slate-500">{bookingResult?.error}</p>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setModule("support")}>Contact Support</Button>
                  <Button type="button" onClick={() => { setBookingStatus("idle"); setCurrentStep(5); }}>Try Different Card</Button>
                </div>
              </div>
            )}

            {bookingStatus === "cancelled" && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-900/40 text-slate-600 flex items-center justify-center">
                  <ArrowRight className="w-10 h-10 transform rotate-180" />
                </div>
                <Badge variant="warning">Booking Cancelled</Badge>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Payment Cancelled</h2>
                <p className="text-sm text-slate-500">You cancelled the payment process. No charges were made.</p>
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => setModule("home")}>Return Home</Button>
                  <Button type="button" onClick={() => { setBookingStatus("idle"); setCurrentStep(5); }}>Return to Payment</Button>
                </div>
              </div>
            )}
          </Card>
        )}

      </form>

      {/* Secure Gateway Simulation Overlay */}
      {showGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
          <Card className="w-full max-w-md p-0 overflow-hidden shadow-2xl flex flex-col h-[500px]">
            <div className="bg-slate-100 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Lock className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider">{paymentProvider === "stripe" ? "Stripe Checkout" : "Razorpay Secure"}</span>
              </div>
              <Badge variant="outline" className="text-[10px]">Test Mode</Badge>
            </div>
            
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 bg-white dark:bg-slate-950">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-2">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Complete your payment</h3>
              <p className="text-sm text-slate-500">
                You are securely connecting to {paymentProvider === "stripe" ? "Stripe" : "Razorpay"} to pay <strong className="text-slate-900 dark:text-white">{formatCurrency(checkoutItem.totalPrice, currency)}</strong>.
              </p>
              
              <div className="pt-8 flex flex-col w-full gap-3">
                <Button onClick={handleGatewaySuccess} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Simulate Successful Payment
                </Button>
                <Button variant="outline" onClick={handleGatewayCancel} className="w-full">
                  Cancel & Return to Merchant
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
