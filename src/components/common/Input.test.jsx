import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Input from "./Input";

describe("Input", () => {
  it("renders a labelled input and accepts user input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Input label="Full name" placeholder="Your name" helpText="As on your ID" onChange={onChange} />);
    const input = screen.getByLabelText("Full name");
    await user.type(input, "Asha");
    expect(input).toHaveValue("Asha");
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveAccessibleDescription("As on your ID");
  });

  it("announces an error and supports disabled state", () => {
    render(<Input label="Email" error="Enter a valid email" disabled />);
    const input = screen.getByLabelText("Email");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email");
    expect(input).toHaveAccessibleDescription(/Enter a valid email/);
  });
});
