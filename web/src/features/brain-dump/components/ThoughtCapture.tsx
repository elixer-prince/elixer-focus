import { Button } from "@/components/ui";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";

type ThoughtCaptureProps = {
  canSave: boolean;
  onAdd: (content: string) => Promise<boolean>;
  onAdded: () => void;
};

const ThoughtCapture = forwardRef<HTMLTextAreaElement, ThoughtCaptureProps>(
  ({ canSave, onAdd, onAdded }, ref) => {
    const [content, setContent] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useImperativeHandle(
      ref,
      () => textareaRef.current as HTMLTextAreaElement,
      [],
    );

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!content.trim()) {
        setError("Add a thought before saving.");
        textareaRef.current?.focus();
        return;
      }
      if (!canSave || isSaving) return;

      setError(null);
      setIsSaving(true);
      try {
        if (await onAdd(content)) {
          setContent("");
          onAdded();
          textareaRef.current?.focus();
        }
      } finally {
        setIsSaving(false);
      }
    };

    const describedBy = error
      ? "brain-dump-capture-help brain-dump-capture-error"
      : "brain-dump-capture-help";

    return (
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="brain-dump-capture"
            className="mb-2 block text-sm font-semibold"
          >
            What’s on your mind?
          </label>
          <textarea
            ref={textareaRef}
            id="brain-dump-capture"
            name="thought"
            rows={4}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            autoComplete="off"
            placeholder="Write it down…"
            className="textarea textarea-primary bg-base-100 focus-visible:ring-primary min-h-32 w-full max-w-prose resize-y text-base leading-relaxed focus-visible:ring-2"
          />
          <p
            id="brain-dump-capture-help"
            className="text-base-content/60 mt-2 text-sm"
          >
            Enter adds a line break. Your thought stays separate from tasks and
            journal entries.
          </p>
          {error && (
            <p
              id="brain-dump-capture-error"
              className="text-error mt-2 text-sm"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!canSave} loading={isSaving}>
            Add
          </Button>
        </div>
      </form>
    );
  },
);

ThoughtCapture.displayName = "ThoughtCapture";

export default ThoughtCapture;
