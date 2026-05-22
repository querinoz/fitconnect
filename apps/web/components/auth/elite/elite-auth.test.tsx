import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Mail, User } from "lucide-react";
import { EliteAuthField } from "../elite-auth-field";
import { EliteAuthPanel } from "../elite-auth-panel";

describe("Elite auth overlays", () => {
  it("renders auth panel with badge and title", () => {
    render(
      <EliteAuthPanel badge="Secure auth" title="Sign in">
        <p>Form body</p>
      </EliteAuthPanel>
    );
    expect(screen.getByText("Secure auth")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
    expect(screen.getByText("Form body")).toBeInTheDocument();
  });

  it("renders labeled auth field", () => {
    render(
      <EliteAuthField
        id="email"
        label="Email"
        icon={Mail}
        placeholder="you@example.com"
      />
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
  });

  it("renders auth field with icon padding", () => {
    render(<EliteAuthField id="name" label="Name" icon={User} />);
    expect(screen.getByLabelText("Name")).toHaveClass("pl-10");
  });
});
