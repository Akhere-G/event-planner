import { useMemo, type KeyboardEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Send } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { chatMessageSchema, type ChatMessageForm } from "./chatSchema";

interface ChatComposerProps {
  onSend: (text: string) => Promise<void>;
  isSending: boolean;
  placeholder: string;
  maxLength: number;
}

export default function ChatComposer({
  onSend,
  isSending,
  placeholder,
  maxLength,
}: ChatComposerProps) {
  const schema = useMemo(() => chatMessageSchema(maxLength), [maxLength]);
  const {
    register,
    handleSubmit,
    resetField,
    control,
    formState: { errors },
  } = useForm<ChatMessageForm>({
    resolver: yupResolver(schema),
    defaultValues: { message: "" },
  });

  const draft = useWatch({ control, name: "message" });

  const submit = handleSubmit(async ({ message }) => {
    resetField("message");
    await onSend(message);
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-1">
      <div className="flex items-end gap-2">
        <Textarea
          {...register("message")}
          aria-label="Message"
          placeholder={placeholder}
          rows={2}
          className="min-h-0 resize-none"
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="btn-primary p-3"
          aria-label="Send message"
          disabled={isSending || !draft.trim()}
        >
          <Send className="size-4" />
        </button>
      </div>
      {errors.message && (
        <p className="errorMessage">{errors.message.message}</p>
      )}
    </form>
  );
}
