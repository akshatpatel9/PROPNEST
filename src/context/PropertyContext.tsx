import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, PropertyStatus } from '../types';
import { supabase } from '../lib/supabase';

interface PropertyContextType {
  properties: Property[];
  addProperty: (property: Omit<Property, 'id' | 'status' | 'likedBy'>) => Promise<void>;
  updatePropertyStatus: (id: string, status: PropertyStatus) => Promise<void>;
  toggleLike: (id: string, userId: string) => Promise<void>;
  loading: boolean;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const initialProperties: Property[] = [
  {
    id: '1',
    sellerId: 'seller1',
    sellerName: 'John Doe',
    sellerEmail: 'john@example.com',
    title: 'Modern Villa in Beverly Hills',
    description: 'A stunning modern villa with panoramic city views, featuring 5 bedrooms, 6 bathrooms, an infinity pool, and a home theater.',
    price: 45000000,
    location: 'Beverly Hills, CA',
    lat: 34.0736,
    lng: -118.4004,
    imageUrl: 'https://images.unsplash.com/photo-1613490900233-141c5560d75d?auto=format&fit=crop&q=80&w=1000',
    status: 'active',
    likedBy: [],
  },
  {
    id: '2',
    sellerId: 'seller2',
    sellerName: 'Jane Smith',
    sellerEmail: 'jane@example.com',
    title: 'Cozy Downtown Loft',
    description: 'Exposed brick walls, high ceilings, and large windows make this downtown loft the perfect urban retreat.',
    price: 8500000,
    location: 'Downtown Seattle, WA',
    lat: 47.6062,
    lng: -122.3321,
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000',
    status: 'active',
    likedBy: [],
  },
  {
    id: '3',
    sellerId: 'seller1',
    sellerName: 'John Doe',
    sellerEmail: 'john@example.com',
    title: 'Suburban Family Home',
    description: 'Spacious 4-bedroom home in a quiet neighborhood with a large backyard, perfect for families.',
    price: 6200000,
    location: 'Austin, TX',
    lat: 30.2672,
    lng: -97.7431,
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000',
    status: 'sold',
    likedBy: [],
  }
];

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedProperties: Property[] = data.map(p => ({
          id: p.id,
          sellerId: p.seller_id,
          sellerName: p.seller_name,
          sellerEmail: p.seller_email,
          sellerPhone: p.seller_phone,
          title: p.title,
          description: p.description,
          price: p.price,
          location: p.location,
          lat: p.lat,
          lng: p.lng,
          imageUrl: p.image_url,
          status: p.status,
          likedBy: p.liked_by || [],
        }));
        setProperties(formattedProperties);
      } else {
        // Fallback to initial properties if database is empty
        setProperties(initialProperties);
      }
    } catch (err) {
      console.error('Error fetching properties from Supabase, falling back to local data:', err);
      const saved = localStorage.getItem('rightsquare_properties');
      if (saved) {
        setProperties(JSON.parse(saved));
      } else {
        setProperties(initialProperties);
      }
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (property: Omit<Property, 'id' | 'status' | 'likedBy'>) => {
    const newId = Math.random().toString(36).substring(7);
    const newProperty = {
      id: newId,
      seller_id: property.sellerId,
      seller_name: property.sellerName,
      seller_email: property.sellerEmail,
      seller_phone: property.sellerPhone,
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      lat: property.lat,
      lng: property.lng,
      image_url: property.imageUrl,
      status: 'active',
      liked_by: [],
    };

    // Optimistic update
    const formattedProperty: Property = {
      ...property,
      id: newId,
      status: 'active',
      likedBy: [],
    };
    setProperties(prev => [formattedProperty, ...prev]);

    try {
      const { error } = await supabase.from('properties').insert([newProperty]);
      if (error) throw error;
    } catch (err) {
      console.error('Error adding property:', err);
      // Revert optimistic update on error
      setProperties(prev => prev.filter(p => p.id !== newId));
    }
  };

  const updatePropertyStatus = async (id: string, status: PropertyStatus) => {
    // Optimistic update
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status } : p));

    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err);
      fetchProperties(); // Revert on error
    }
  };

  const toggleLike = async (id: string, userId: string) => {
    const property = properties.find(p => p.id === id);
    if (!property) return;

    const currentLikedBy = property.likedBy || [];
    const hasLiked = currentLikedBy.includes(userId);
    const newLikedBy = hasLiked
      ? currentLikedBy.filter(uid => uid !== userId)
      : [...currentLikedBy, userId];

    // Optimistic update
    setProperties(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, likedBy: newLikedBy };
      }
      return p;
    }));

    try {
      const { error } = await supabase
        .from('properties')
        .update({ liked_by: newLikedBy })
        .eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling like:', err);
      fetchProperties(); // Revert on error
    }
  };

  return (
    <PropertyContext.Provider value={{ properties, addProperty, updatePropertyStatus, toggleLike, loading }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};
