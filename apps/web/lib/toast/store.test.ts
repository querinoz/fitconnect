import { describe, expect, it, beforeEach } from "vitest";
import { useToastStore } from "./store";

describe("toast store", () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it("pushes and dismisses toasts", () => {
    useToastStore.getState().push({ title: "Saved", tone: "success" });
    expect(useToastStore.getState().toasts).toHaveLength(1);
    const id = useToastStore.getState().toasts[0]!.id;
    useToastStore.getState().dismiss(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
