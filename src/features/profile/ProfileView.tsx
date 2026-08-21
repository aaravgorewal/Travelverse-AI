import React, { useState } from "react";
import {
  User,
  Award,
  Leaf,
  Shield,
  CreditCard,
  Settings,
  Heart,
  Plane,
  Building,
  CheckCircle2,
  Edit2,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useUIStore } from "../../stores/useUIStore";
import { Button, Card, Badge, Input } from "../../components/ui";

export const ProfileView: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const { setModule } = useUIStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "Elena Rostova");
  const [passportNumber, setPassportNumber] = useState(user?.passportNumber || "US-992817441");
  const [dietary, setDietary] = useState(user?.dietary || "Pescatarian");
  const [seatPreference, setSeatPreference] = useState(user?.seatPreference || "Window");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name,
      passportNumber,
      dietary,
      seatPreference,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Traveler Hero Profile Card */}
      <Card className="p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border-blue-800/40">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}
            alt={user?.name || "User"}
            className="h-24 w-24 rounded-3xl object-cover ring-4 ring-white/20 shadow-2xl"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black">{user?.name}</h1>
              <Badge variant="purple">Diamond Tier VIP</Badge>
            </div>
            <p className="text-xs text-blue-200">{user?.email} • Member since 2024</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-300">
              <span>⭐ {(user?.loyaltyPoints || 0).toLocaleString()} Frequent Flyer Miles</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" /> {(user?.carbonOffsetKg || 0).toLocaleString()} kg CO₂ Offset
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </Card>

      {/* Edit Form or Display Grid */}
      {isEditing ? (
        <Card className="p-6 sm:p-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Traveler Credentials</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Passport / ID Number</label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Dietary Requirements</label>
                <input
                  type="text"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Seat Preference</label>
                <select
                  value={seatPreference}
                  onChange={(e) => setSeatPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Window">Window</option>
                  <option value="Aisle">Aisle</option>
                  <option value="Extra Legroom">Extra Legroom</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Preferences Summary */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Travel DNA & AI Sync</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Seat Preference:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.seatPreference || "Window"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Dietary Profile:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.dietary || "Pescatarian"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Cabin Class Default:</span>
                <span className="font-bold text-slate-900 dark:text-white">{user?.preferredCabin || "Business / First"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Hotel Style:</span>
                <span className="font-bold text-slate-900 dark:text-white">Boutique & 5-Star Resorts</span>
              </div>
            </div>
          </Card>

          {/* Loyalty & Carbon Offset */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Miles & Sustainability Vault</span>
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                <div className="flex justify-between font-bold text-amber-900 dark:text-amber-200">
                  <span>TravelVerse Miles Balance</span>
                  <span>{(user?.loyaltyPoints || 0).toLocaleString()} PTS</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Redeemable for free upgrades, lounge passes & helicopter transfers.</p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-200">
                  <span>Zero-Carbon Travel Ledger</span>
                  <span>100% Certified Offsets</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">All flights booked are automatically offset through verified mangrove reforestation projects.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
