import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AddProperty } from './pages/AddProperty';
import { FloorPlanGenerator } from './pages/FloorPlanGenerator';
import { ImageAnalyzer } from './pages/ImageAnalyzer';
import { PropertyDetails } from './pages/PropertyDetails';

export default function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="add-property" element={<AddProperty />} />
              <Route path="property/:id" element={<PropertyDetails />} />
              <Route path="ai-floor-plan" element={<FloorPlanGenerator />} />
              <Route path="image-analyzer" element={<ImageAnalyzer />} />
            </Route>
          </Routes>
        </Router>
      </PropertyProvider>
    </AuthProvider>
  );
}
