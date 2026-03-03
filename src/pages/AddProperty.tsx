import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { Input, Button } from '../components/ui';
import { CreditCard, CheckCircle2, Home, MapPin, DollarSign, Image as ImageIcon, FileText, Smartphone, Map as MapIcon, Phone } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export const AddProperty = () => {
  const { user } = useAuth();
  const { addProperty } = useProperties();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    imageUrl: '',
    sellerPhone: '',
  });
  const [mapPosition, setMapPosition] = useState<L.LatLng | null>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="mt-2 text-slate-500">Please log in to list properties.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate payment processing
    setTimeout(() => {
      setStep(2);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProperty({
      sellerId: user.id,
      sellerName: user.name,
      sellerEmail: user.email,
      sellerPhone: formData.sellerPhone,
      title: formData.title,
      description: formData.description,
      price: Number(formData.price),
      location: formData.location,
      lat: mapPosition?.lat,
      lng: mapPosition?.lng,
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=1000',
    });
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step === 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === 1 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}>
            1
          </div>
          <span className="font-medium">Payment</span>
        </div>
        <div className="h-0.5 w-12 bg-slate-200" />
        <div className={`flex items-center space-x-2 ${step === 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${step === 2 ? 'border-indigo-600 bg-indigo-50' : 'border-slate-300'}`}>
            2
          </div>
          <span className="font-medium">Details</span>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {step === 1 ? (
          <form onSubmit={handlePayment} className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-4">
                <CreditCard className="h-8 w-8 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Listing Fee</h2>
              <p className="mt-2 text-slate-500">A one-time fee of ₹1,499 is required to list your property.</p>
              <div className="mt-4 text-4xl font-extrabold text-indigo-600">₹1,499</div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <CreditCard className="h-5 w-5" /> Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-colors ${paymentMethod === 'upi' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <Smartphone className="h-5 w-5" /> UPI
              </button>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                  <Input placeholder="0000 0000 0000 0000" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                    <Input placeholder="MM/YY" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                    <Input placeholder="123" required />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">UPI ID</label>
                  <Input placeholder="username@upi" required />
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-center text-sm text-slate-600">
                  Or scan the QR code on your UPI app to pay.
                  <div className="mx-auto mt-4 h-32 w-32 bg-white border border-slate-200 rounded-lg flex items-center justify-center">
                    <span className="text-slate-400 text-xs">QR Code Placeholder</span>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full h-12 text-base mt-8">
              Pay ₹1,499 & Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Payment Successful</h2>
              <p className="mt-2 text-slate-500">Now, let's add your property details.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Home className="h-4 w-4" /> Property Title
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Modern Villa in Beverly Hills"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Location Name
                </label>
                <Input
                  required
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Beverly Hills, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                  <MapIcon className="h-4 w-4" /> Pin Location on Map
                </label>
                <p className="text-xs text-slate-500 mb-2">Click on the map to drop a pin for your property's exact location.</p>
                <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-300 relative z-0">
                  <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                  </MapContainer>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Contact Phone Number
                </label>
                <Input
                  required
                  type="tel"
                  value={formData.sellerPhone}
                  onChange={e => setFormData({ ...formData, sellerPhone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> Price (₹)
                </label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 45000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" /> Image URL
                </label>
                <Input
                  value={formData.imageUrl}
                  onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Description
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your property..."
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full h-12 text-base mt-8">
              List Property
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
