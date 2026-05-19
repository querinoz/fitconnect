"use client";

import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export type Toast = {
  id: string;
  title: string;
  body?: string;
  tone: ToastTone;
};

type ToastState = {
  toasts: Toast[];
  push: (input: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (input) =>
    set((s) => ({
      toasts: [...s.toasts, { ...input, id: `toast-${Date.now()}` }].slice(-4)
    })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
}));

export function toastSuccess(title: string, body?: string) {
  useToastStore.getState().push({ title, body, tone: "success" });
}

export function toastError(title: string, body?: string) {
  useToastStore.getState().push({ title, body, tone: "error" });
}

export function toastInfo(title: string, body?: string) {
  useToastStore.getState().push({ title, body, tone: "info" });
}
