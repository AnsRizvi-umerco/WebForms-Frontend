import { useEffect } from "react";
import { useToast, type ToastVariant } from "@/components/umerco/toast";

export function useToastMessage(
  message: string | null | undefined,
  variant: Extract<ToastVariant, "error" | "warning" | "info"> = "error"
) {
  const toast = useToast();

  useEffect(() => {
    if (!message?.trim()) return;
    toast[variant](message);
  }, [message, variant, toast]);
}
