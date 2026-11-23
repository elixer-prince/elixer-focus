import { fireEvent, render, screen } from "@testing-library/react";

import Modal from "@/components/ui/Modal";

describe("Modal", () => {
  it("should render the modal dialog element", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Test content</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog).toBeInTheDocument();
  });

  it("should display the title when provided", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="My Modal Title">
        <p>Content</p>
      </Modal>,
    );

    expect(screen.getByText("My Modal Title")).toBeInTheDocument();
  });

  it("should not render a title when not provided", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByText("My Modal Title")).not.toBeInTheDocument();
  });

  it("should render children content", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Custom child content</p>
      </Modal>,
    );

    expect(screen.getByText("Custom child content")).toBeInTheDocument();
  });

  it("should render a close button by default", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );

    const closeButton = screen.getByText("Close");
    expect(closeButton).toBeInTheDocument();
  });

  it("should hide the close button when showCloseButton is false", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p>Content</p>
      </Modal>,
    );

    expect(screen.queryByText("Close")).not.toBeInTheDocument();
  });

  it("should call onClose when the close button is clicked", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText("Close"));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the backdrop is clicked", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent.click(dialog!);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when clicking inside the modal box", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    fireEvent.click(screen.getByText("Content"));
    expect(handleClose).not.toHaveBeenCalled();
  });

  it("should call onClose when Escape key is pressed", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent.keyDown(dialog!, { key: "Escape" });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should apply size class sm", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <p>Content</p>
      </Modal>,
    );

    const modalBox = document.querySelector(".modal-box");
    expect(modalBox?.classList.contains("max-w-sm")).toBe(true);
  });

  it("should apply size class md by default", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );

    const modalBox = document.querySelector(".modal-box");
    expect(modalBox?.classList.contains("max-w-lg")).toBe(true);
  });

  it("should apply size class lg", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <p>Content</p>
      </Modal>,
    );

    const modalBox = document.querySelector(".modal-box");
    expect(modalBox?.classList.contains("max-w-2xl")).toBe(true);
  });

  it("should forward ref to the dialog element", () => {
    const ref = { current: null as HTMLDialogElement | null };

    render(
      <Modal ref={ref} isOpen={true} onClose={() => {}}>
        <p>Content</p>
      </Modal>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDialogElement);
  });

  it("should sync externalRef to the dialog element", () => {
    const externalRef = { current: null as HTMLDialogElement | null };

    render(
      <Modal isOpen={true} onClose={() => {}} externalRef={externalRef}>
        <p>Content</p>
      </Modal>,
    );

    expect(externalRef.current).toBeInstanceOf(HTMLDialogElement);
  });

  it("should open the dialog when isOpen becomes true", () => {
    const handleClose = vi.fn();

    const { rerender } = render(
      <Modal isOpen={false} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog?.open).toBe(false);

    rerender(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    expect(dialog?.open).toBe(true);
  });

  it("should close the dialog when isOpen becomes false", () => {
    const handleClose = vi.fn();

    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    expect(dialog?.open).toBe(true);

    rerender(
      <Modal isOpen={false} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    expect(dialog?.open).toBe(false);
  });

  it("should not call onClose when non-Escape key is pressed", () => {
    const handleClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Content</p>
      </Modal>,
    );

    const dialog = document.querySelector("dialog");
    fireEvent.keyDown(dialog!, { key: "Enter" });
    expect(handleClose).not.toHaveBeenCalled();
  });
});
