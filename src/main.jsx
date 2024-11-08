import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { CarProvider } from './CarContext';
import axios from 'axios';

// Import global polyfills
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Page Components
import Dashboard from './Dashboard';
import ActiveBids from './Bid';
import Deal from './Deal';
import Settings from './Settings';
import Statistics from './Statistics';
import Tracking from './Tracking';
import Listing from './Listing';
import VehicleDetails from './VehicleDetails';
import Login from './login';
import SignUp from './SignUp';
import VehicleHistory from './VehicleHistory';
import ServiceRecordForm from './ServiceRecordForm';
import VehicleMarketplace from './VehicleMarketplace';
import VehicleRegister from './VehicleRegister';

// Styles
import './index.css';

// main.jsx - update axios configuration
axios.defaults.baseURL = 'http://127.0.0.1:8000';
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Accept'] = 'application/json';

// Setup axios defaults
axios.interceptors.response.use(
    response => {
        // If the response contains image paths, transform them to full URLs
        if (response.data && response.data.images) {
            response.data.images = response.data.images.map(img => ({
                ...img,
                url: img.url.startsWith('http') ? 
                    img.url : 
                    `${axios.defaults.baseURL}${img.url}`
            }));
        }
        return response;
    },
    error => {
        return Promise.reject(error);
    }
);

// Add error interceptor to handle unauthorized requests
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Update ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Web3 Configuration
const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider, 'any');
  library.pollingInterval = 12000;
  return library;
};

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem('user');
//   return isAuthenticated ? children : <Navigate to="/login" replace />;
// };

// Main App Component
function MainApp() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <CarProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/active-bids" element={
              <ProtectedRoute>
                <ActiveBids />
              </ProtectedRoute>
            } />
            <Route path="/deals" element={
              <ProtectedRoute>
                <Deal />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/statistics" element={
              <ProtectedRoute>
                <Statistics />
              </ProtectedRoute>
            } />
            <Route path="/listing" element={
              <ProtectedRoute>
                <Listing />
              </ProtectedRoute>
            } />
            <Route path="/tracking" element={
              <ProtectedRoute>
                <Tracking />
              </ProtectedRoute>
            } />
            <Route path="/vehicle/:id" element={
              <ProtectedRoute>
                <VehicleDetails />
              </ProtectedRoute>
            } />

            {/* Vehicle Management Routes */}
            <Route path="/vehicle/:vin/history" element={
              <ProtectedRoute>
                <VehicleHistory />
              </ProtectedRoute>
            } />
            <Route path="/vehicle/:vin/add-service-record" element={
              <ProtectedRoute>
                <ServiceRecordForm />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <VehicleMarketplace />
              </ProtectedRoute>
            } />
            <Route path="/register-vehicle" element={
              <ProtectedRoute>
                <VehicleRegister />
              </ProtectedRoute>
            } />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CarProvider>
    </Web3ReactProvider>
  );
}

// Mount the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MainApp />
  </React.StrictMode>
);