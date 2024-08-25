import React, { createContext, useContext, useState, ReactNode } from "react";
import { Item } from "../model/item";

interface ModalContextType {
  showModal: boolean;
  modalItem?: Item;
  openModal: (item: Item) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalItem, setModalItem] = useState<Item | undefined>(undefined);

  const openModal = (item: Item) => {
    setModalItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <ModalContext.Provider
      value={{ showModal, modalItem, openModal, closeModal }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
