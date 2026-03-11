import React, { useState } from 'react';
import { useProperties } from '../context/PropertyContext';
import { PropertyCard } from '../components/PropertyCard';
import { Input, Button } from '../components/ui';
import { Search, SlidersHorizontal } from 'lucide-react';

export const Home = () => {
  const { properties } = useProperties();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'sold'>('all');

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-24 text-center sm:px-12 lg:px-16 shadow-2xl border border-white/10">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center mix-blend-overlay" />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl drop-shadow-lg">
            Find your perfect nest.
          </h1>
          <p className="text-lg text-white sm:text-xl drop-shadow-md">
            Browse thousands of properties, connect with sellers, and use AI to envision your future home.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-sm p-2 shadow-xl focus-within:ring-2 focus-within:ring-emerald-500">
            <Search className="ml-3 h-5 w-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by location or title..."
              className="flex-1 border-0 bg-transparent px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-500 text-white border-none">Search</Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">Featured Properties</h2>
        <div className="flex items-center gap-2">
          <Button 
            className={`h-9 px-4 text-xs ${filterStatus === 'all' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-none' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button 
            className={`h-9 px-4 text-xs ${filterStatus === 'active' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-none' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button 
            className={`h-9 px-4 text-xs ${filterStatus === 'sold' ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-none' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
            onClick={() => setFilterStatus('sold')}
          >
            Sold
          </Button>
        </div>
      </div>

      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No properties found</h3>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};
