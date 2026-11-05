"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import BookingModal from "./BookingModal";

interface BookingModalContextValue {
  openBookingModal: () => void;
  isOpen: boolean;
}

const BookingModalContext = createContext<BookingModalContextValue>({
  openBookingModal: () => {},
  isOpen: false,
});

export function useBookingModal() {
  return useContext(BookingModalContext);
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openBookingModal = useCallback(() => setOpen(true), []);
  const closeBookingModal = useCallback(() => setOpen(false), []);

  return (
    <BookingModalContext.Provider value={{ openBookingModal, isOpen: open }}>
      {children}
      <BookingModal open={open} onClose={closeBookingModal} />
    </BookingModalContext.Provider>
  );
}