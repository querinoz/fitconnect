"use client";

import { create } from "zustand";

type QuizModalState = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const useQuizModalStore = create<QuizModalState>((set) => ({
  open: false,
  setOpen: (open) => set({ open })
}));
