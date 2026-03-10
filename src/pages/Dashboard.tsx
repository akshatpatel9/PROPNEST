import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useProperties } from '../context/PropertyContext';
import { PropertyCard } from '../components/PropertyCard';
import { Button } from '../components/ui';
import { Link } from 'react-router-dom';
import { PlusSquare, Heart, Building2, User as UserIcon, Mail, Bookmark } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const { properties, updatePropertyStatus } = useProperties();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Please log in to view your dashboard</h2>
        <Link to="/login" className="mt-4">
          <Button variant="primary">Log in</Button>
        </Link>
      </div>
    );
  }

  const myProperties = properties.filter(p => p.sellerId === user.id);
  const savedProperties = properties.filter(p => user.savedProperties ? user.savedProperties.includes(p.id) : false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{user.name}</h1>
            <div className="flex items-center gap-2 text-slate-500 mt-1">
              <Mail className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>
        <Link to="/add-property">
          <Button className="gap-2 w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white border-none">
            <PlusSquare className="h-4 w-4" /> List New Property
          </Button>
        </Link>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Bookmark className="h-5 w-5 text-emerald-500" />
            <h2 className="text-xl font-semibold text-slate-900">Saved Properties</h2>
          </div>
          {savedProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Bookmark className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No saved properties</h3>
              <p className="mt-1 text-sm text-slate-500">Start browsing and save properties for later.</p>
              <Link to="/" className="mt-6 inline-block">
                <Button variant="outline">Browse Properties</Button>
              </Link>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-slate-900">My Listings</h2>
          </div>
          {myProperties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myProperties.map(property => (
                <div key={property.id} className="relative group">
                  <PropertyCard property={property} />
                  <div className="absolute top-12 left-3 z-10">
                    <Button
                      className={`h-8 px-3 text-xs shadow-sm border-none ${property.status === 'active' ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
                      onClick={() => updatePropertyStatus(property.id, property.status === 'active' ? 'sold' : 'active')}
                    >
                      Mark as {property.status === 'active' ? 'Sold' : 'Active'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No listings yet</h3>
              <p className="mt-1 text-sm text-slate-500">List your first property to start receiving offers.</p>
              <Link to="/add-property" className="mt-6 inline-block">
                <Button variant="primary">List Property</Button>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
