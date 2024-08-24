import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingContextProps {
  loading: boolean;
  startLoading: () => void;
  endLoading: () => void;
}

const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined,
);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(true);

  const startLoading = () => setLoading(true);
  const endLoading = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, startLoading, endLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextProps => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
