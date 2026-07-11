import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CityContextType {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  cityData: any;
  setCityData: (data: any) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cityData, setCityData] = useState<any>(null);

  // When selectedCity changes, explicitly open the modal
  const handleSetSelectedCity = (city: string | null) => {
    setSelectedCity(city);
    if (city) {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
      setCityData(null);
    }
  };

  const handleSetIsModalOpen = (isOpen: boolean) => {
    setIsModalOpen(isOpen);
    if (!isOpen) {
      setSelectedCity(null);
      setCityData(null);
    }
  };

  return (
    <CityContext.Provider value={{ 
      selectedCity, 
      setSelectedCity: handleSetSelectedCity, 
      isModalOpen, 
      setIsModalOpen: handleSetIsModalOpen, 
      cityData, 
      setCityData 
    }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCityContext = () => {
  const context = useContext(CityContext);
  if (context === undefined) {
    throw new Error('useCityContext must be used within a CityProvider');
  }
  return context;
};
