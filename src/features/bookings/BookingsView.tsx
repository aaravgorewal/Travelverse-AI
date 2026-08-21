import React, { useState } from "react";
import {
  CreditCard,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
  Clock,
  Printer,
  XCircle,
  AlertCircle,
  Share2,
} from "lucide-react";
import { useTravelStore } from "../../stores/useTravelStore";
import { useUIStore } from "../../stores/useUIStore";
import { BookingRecord } from "../../types";
import { Button, Card, Badge, Modal } from "../../components/ui";
import { formatCurrency, formatDate } from "../../lib/utils";

export const BookingsView: React.FC = () => {
  const { bookings, currency, cancelBooking } = useTravelStore();
  const { setModule } = useUIStore();
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="purple">Travel Vault</Badge>
            <span className="text-xs text-slate-400 font-semibold">Active & Archived Vouchers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Bookings & Boarding Passes
          </h1>
        </div>

        <Button onClick={() => setModule("home")}>Explore & Book New Travel</Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((booking) => {
          const ref = booking.referenceCode || booking.referenceNumber || booking.id;
          const totalCost = booking.totalAmount ?? booking.totalPrice ?? 0;
          const travelers = booking.travelersCount || booking.passengers?.length || 1;
          const travelDateStr = booking.travelDate || booking.dates?.start || booking.bookingDate || "Upcoming";
          const returnDateStr = booking.returnDate || booking.dates?.end;

          return (
            <Card key={booking.id} hoverEffect className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={booking.status === "confirmed" ? "success" : "danger"} size="sm">
                      {booking.status.toUpperCase()}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-slate-500">Ref: {ref}</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{booking.title}</h3>

                  <p className="text-xs text-slate-400 flex items-center gap-3">
                    <span>Type: <strong className="capitalize text-slate-300">{booking.type}</strong></span>
                    <span>•</span>
                    <span>Travelers: <strong className="text-slate-300">{travelers}</strong></span>
                    <span>•</span>
                    <span>Booked on: {formatDate(booking.createdAt || booking.bookingDate || new Date().toISOString())}</span>
                  </p>
                </div>

                {/* Center Dates */}
                <div className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Scheduled Travel Dates</p>
                  <p className="font-bold">
                    {travelDateStr} {returnDateStr ? `➔ ${returnDateStr}` : ""}
                  </p>
                </div>

                {/* Right Pricing & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Paid</span>
                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {formatCurrency(totalCost, currency)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Voucher</span>
                    </Button>

                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => cancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Booking Voucher Modal */}
      {selectedBooking && (
        <Modal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          title={`Booking Voucher #${selectedBooking.referenceCode || selectedBooking.referenceNumber || selectedBooking.id}`}
          description={`Issued by TravelVerse AI Global GDS Network • Status: ${selectedBooking.status.toUpperCase()}`}
          size="lg"
        >
          <div className="space-y-6 text-slate-900 dark:text-white">
            {/* Voucher Banner Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-blue-200">Official Confirmation Pass</span>
                <span className="text-xs font-mono font-bold bg-white/20 px-2.5 py-1 rounded-lg">
                  {selectedBooking.referenceCode || selectedBooking.referenceNumber || selectedBooking.id}
                </span>
              </div>
              <h3 className="text-xl font-extrabold">{selectedBooking.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-xs text-blue-100 pt-2 border-t border-white/20">
                <div>
                  <p className="text-blue-300 text-[10px] uppercase font-bold">Traveler</p>
                  <p className="font-bold">{selectedBooking.travelersCount || selectedBooking.passengers?.length || 1} Passenger(s)</p>
                </div>
                <div>
                  <p className="text-blue-300 text-[10px] uppercase font-bold">Dates</p>
                  <p className="font-bold">{selectedBooking.travelDate || selectedBooking.dates?.start || "Confirmed"}</p>
                </div>
              </div>
            </div>

            {/* QR Simulation and Inclusions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="space-y-1 text-xs">
                <p className="font-bold">Contactless Check-In Enabled</p>
                <p className="text-slate-500">Scan this QR barcode at the airport kiosk or hotel front desk for instant priority key issuance.</p>
              </div>

              <div className="p-2 rounded-xl bg-white text-black shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-900 flex items-center justify-center text-white text-[10px] font-mono text-center p-2 rounded-lg">
                  [QR ENCRYPTED PASS]
                </div>
                <span className="text-[9px] font-mono mt-1 text-slate-500">{selectedBooking.referenceCode || selectedBooking.referenceNumber}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Close
              </Button>
              <Button onClick={() => window.print()} className="gap-1.5">
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
