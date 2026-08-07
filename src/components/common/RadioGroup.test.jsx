import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import RadioGroup from "./RadioGroup";

const options = [{ label: "Salaried", value: "salaried" }, { label: "Self-employed", value: "self" }];

function ControlledGroup() {
  const [value, setValue] = useState("");
  return <RadioGroup legend="Employment type" name="employment" options={options} value={value} onChange={(event) => setValue(event.target.value)} />;
}

describe("RadioGroup", () => {
  it("renders a fieldset and changes selection", async () => {
    const user = userEvent.setup();
    render(<ControlledGroup />);
    const salaried = screen.getByRole("radio", { name: "Salaried" });
    await user.click(salaried);
    expect(salaried).toBeChecked();
    expect(screen.getByRole("group", { name: "Employment type" })).toBeInTheDocument();
  });

  it("supports error and disabled states", () => {
    render(<RadioGroup legend="Employment type" name="employment" options={options} error="Choose one option" disabled />);
    expect(screen.getByRole("radio", { name: "Salaried" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("Choose one option");
  });
});
