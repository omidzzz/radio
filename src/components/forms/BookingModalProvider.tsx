"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";
import dynamic from "next/dynamic";

// The form, validation, and date-picker code is only needed after the visitor
// opens the booking dialog. Keep it out of the initial page bundle.
const BookingModal = dynamic(() => import("./BookingModal"), { ssr: false });

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