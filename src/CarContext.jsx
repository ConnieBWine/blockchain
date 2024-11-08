import React, { createContext, useContext } from 'react';
import carsData from './carsData';  // Import the cars data

const CarContext = createContext();

export const CarProvider = ({ children }) => {
  return (
    <CarContext.Provider value={{ cars: carsData }}>
      {children}
    </CarContext.Provider>
  );
};

export const useCars = () => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCars must be used within a CarProvider');
  }
  return context;
};