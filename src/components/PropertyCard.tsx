import React from 'react';
import { Heart, MapPin, Tag, Mail, Phone } from 'lucide-react';
import { Property } from '../types';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { Button, cn } from './ui';
import { useNavigate } from 'react-router-dom';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { user, toggleSavedProperty } = useAuth();
  const { toggleLike } = useProperties();
  const navigate = useNavigate();

  const isSaved = user?.savedProperties ? user.savedProperties.includes(property.id) : false;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleSavedProperty(property.id);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleLike(property.id, user.id);
  };

  const hasLiked = user && property.likedBy ? property.likedBy.includes(user.id) : false;
  const likeCount = property.likedBy ? property.likedBy.length : 0;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md w-full cursor-pointer"
      onClick={() => navigate(`/property/${property.id}`)}
    >
      <div className="relative aspect-[4/3] overflow-hidden w-full">
        <img
          src={property.imageUrl}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {property.status === 'sold' && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-white shadow-sm flex items-center gap-1">
              <Tag className="h-4 w-4" /> Sold
            </span>
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave(e);
            }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-110",
              isSaved ? "text-red-500" : "text-slate-400"
            )}
          >
            <Heart className={cn("h-5 w-5", isSaved && "fill-current")} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-sm">
            ₹{property.price.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-slate-900 line-clamp-1 text-base sm:text-lg">{property.title}</h3>
        </div>
        
        <div className="mt-2 flex items-center gap-1.5 text-xs sm:text-sm text-slate-500">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2 flex-1">
          {property.description}
        </p>

        <div className="mt-3 space-y-1">
          {property.sellerEmail && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{property.sellerEmail}</span>
            </div>
          )}
          {property.sellerPhone && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Phone className="h-3 w-3 shrink-0" />
              <span className="truncate">{property.sellerPhone}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLike(e);
              }}
              className={cn("flex items-center gap-1.5 transition-colors group/like", hasLiked ? "text-indigo-600" : "hover:text-indigo-600")}
            >
              <Heart className={cn("h-4 w-4 group-hover/like:scale-110 transition-transform", hasLiked && "fill-current")} />
              <span className="font-medium">{likeCount}</span>
            </button>
          </div>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/property/${property.id}`); }}>View Details</Button>
        </div>
      </div>
    </div>
  );
};
