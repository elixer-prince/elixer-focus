import {
  type PropsWithChildren,
  type RefObject,
  useRef,
  useEffect,
  forwardRef,
} from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg";
  externalRef?: RefObject<HTMLDialogElement | null>;
}

const Modal = forwardRef<HTMLDialogElement, PropsWithChildren<ModalProps>>(
  (
    {
      isOpen,
      onClose,
      title,
      showCloseButton = true,
      size = "md",
      externalRef,
      children,
    },
    ref,
  ) => {
    const internalRef = useRef<HTMLDialogElement | null>(null);
    const resolvedRef = (ref ??
      internalRef) as RefObject<HTMLDialogElement | null>;

    useEffect(() => {
      if (externalRef) {
        externalRef.current = resolvedRef.current;
      }
    }, [externalRef, resolvedRef]);

    useEffect(() => {
      const dialog = resolvedRef.current;
      if (!dialog) return;

      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }, [isOpen, resolvedRef]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === resolvedRef.current) {
        onClose();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const sizeClasses = {
      sm: "max-w-sm",
      md: "max-w-lg",
      lg: "max-w-2xl",
    };

    return (
      <dialog
        ref={resolvedRef}
        className="modal backdrop-blur-sm"
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
      >
        <div className={`modal-box ${sizeClasses[size]} p-6`}>
          {title && (
            <h3 className="text-xl leading-tight font-bold tracking-tight">
              {title}
            </h3>
          )}

          <div className="mt-4">{children}</div>

          {showCloseButton && (
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-sm btn-ghost normal-case"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </dialog>
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
