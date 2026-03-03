import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { useAuth } from '../context/AuthContext';
import { MapPin, Heart, ArrowLeft, Mail, User, Phone, Loader2 } from 'lucide-react';
import { Button, cn } from '../components/ui';
import { supabase } from '../lib/supabase';

export const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties, toggleLike } = useProperties();
  const { user, toggleSavedProperty } = useAuth();
  
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const property = properties.find(p => p.id === id);

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Property Not Found</h2>
        <p className="mt-2 text-slate-500">The property you are looking for does not exist or has been removed.</p>
        <Button variant="primary" className="mt-6" onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const isSaved = user?.savedProperties?.includes(property.id) || false;
  const hasLiked = user && property.likedBy ? property.likedBy.includes(user.id) : false;
  const likeCount = property.likedBy ? property.likedBy.length : 0;

  const handleSave = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleSavedProperty(property.id);
  };

  const handleLike = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    toggleLike(property.id, user.id);
  };

  const handleSendMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!message.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from('inquiries').insert([{
        property_id: property.id,
        sender_id: user.id,
        receiver_id: property.sellerId,
        message: message.trim()
      }]);

      if (error) throw error;
      setSent(true);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-8 space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
            <img 
              src={property.imageUrl} 
              alt={property.title} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleSave}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110",
                  isSaved ? "text-red-500" : "text-slate-700"
                )}
              >
                <Heart className={cn("h-6 w-6", isSaved && "fill-current")} />
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{property.title}</h1>
                <div className="mt-2 flex items-center gap-2 text-slate-500">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">{property.location}</span>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-3xl font-extrabold text-indigo-600">
                  ₹{property.price.toLocaleString('en-IN')}
                </div>
                <div className="mt-2 flex items-center sm:justify-end gap-1.5 text-sm text-slate-500">
                  <button 
                    onClick={handleLike}
                    className={cn("flex items-center gap-1.5 transition-colors group/like", hasLiked ? "text-indigo-600" : "hover:text-indigo-600")}
                  >
                    <Heart className={cn("h-5 w-5 group-hover/like:scale-110 transition-transform", hasLiked && "fill-current")} />
                    <span className="font-medium text-base">{likeCount} likes</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Contact Seller</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{property.sellerName || 'Verified Seller'}</p>
                  <p className="text-xs text-slate-500">Property Owner</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{property.sellerEmail || 'contact@propnest.com'}</p>
                  <p className="text-xs text-slate-500">Email Address</p>
                </div>
              </div>

              {property.sellerPhone && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{property.sellerPhone}</p>
                    <p className="text-xs text-slate-500">Phone Number</p>
                  </div>
                </div>
              )}

              {sent ? (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-center text-sm text-green-600 border border-green-100">
                  Message sent successfully! The seller will contact you soon.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I am interested in this property..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[100px] resize-y"
                  />
                  <Button 
                    variant="primary" 
                    className="w-full" 
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                  >
                    {sending ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Send Message'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Location Map</h2>
            <div className="aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
              {property.lat && property.lng ? (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${property.lat},${property.lng}&z=15&output=embed`}
                  allowFullScreen
                ></iframe>
              ) : (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location)}&z=15&output=embed`}
                  allowFullScreen
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
