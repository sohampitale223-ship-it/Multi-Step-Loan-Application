import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CurrencyInput from "./CurrencyInput";
import { formatINR } from "./currencyUtils";

describe("CurrencyInput", () => {
  it.each([[50000, "₹50,000"], [100000, "₹1,00,000"], [1050000, "₹10,50,000"]])(
    "formats %s with Indian grouping",
    (raw, formatted) => expect(formatINR(raw)).toBe(formatted),
  );

  it("keeps a raw numeric value while showing formatted INR", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyInput label="Loan amount" onChange={onChange} />);
    const input = screen.getByLabelText("Loan amount");
    await user.type(input, "1050000abc");
    expect(input).toHaveValue("₹10,50,000");
    expect(onChange.mock.calls.at(-1)[0].target.value).toBe("1050000");
  });

  it("renders errors and disabled state", () => {
    render(<CurrencyInput label="Amount" value="50000" error="Amount is required" disabled />);
    expect(screen.getByLabelText("Amount")).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Amount is required");
  });
});
