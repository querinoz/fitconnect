import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreatePostModal } from "./create-post-modal";

describe("CreatePostModal", () => {
  it("keeps the composer open when publish is rejected", async () => {
    const user = userEvent.setup();
    const onPublish = vi.fn().mockResolvedValue(false);
    const onOpenChange = vi.fn();
    render(<CreatePostModal open onOpenChange={onOpenChange} onPublish={onPublish} />);
    await user.type(screen.getByPlaceholderText(/share a pr/i), "Morning strides");
    await user.click(screen.getByRole("button", { name: /post to feed/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/nothing was published/i);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
