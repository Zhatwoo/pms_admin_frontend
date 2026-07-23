"use client";

import { useState, useEffect } from "react";
import { Modal } from "./modal";
import { Mail, Send } from "lucide-react";

interface SendReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  clientEmail: string;
  amountOwed: string;
  reason: "overdue_invoice" | "failed_subscription";
}

export function SendReminderModal({
  isOpen,
  onClose,
  clientName,
  clientEmail,
  amountOwed,
  reason,
}: SendReminderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (reason === "overdue_invoice") {
        setSubject(`Action Required: Overdue Invoice for ${clientName}`);
        setMessage(
          `Hi ${clientName} Team,\n\nThis is a friendly reminder that your recent invoice for ${amountOwed} is currently overdue. \n\nTo ensure your service remains active, please process the payment as soon as possible. You can view and pay your invoice securely by logging into your dashboard.\n\nThank you,\nPawnshop Management Support`
        );
      } else {
        setSubject(`Action Required: Subscription Payment Failed for ${clientName}`);
        setMessage(
          `Hi ${clientName} Team,\n\nWe were unable to process your most recent subscription payment of ${amountOwed}. \n\nYour account is currently past due. Please update your billing information or ensure sufficient funds are available to avoid service interruption.\n\nThank you,\nPawnshop Management Support`
        );
      }
    }
  }, [isOpen, reason, clientName, amountOwed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="Send Payment Reminder"
      subtitle="Send a billing notification directly to the client."
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
              Recipient
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                readOnly
                value={clientEmail}
                className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none"
                style={{
                  background: "var(--cm-surface-secondary)",
                  borderColor: "var(--cm-border)",
                  color: "var(--cm-text-muted)",
                } as React.CSSProperties}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                background: "var(--cm-input-bg)",
                borderColor: "var(--cm-input-border)",
                color: "var(--cm-text-primary)",
                "--tw-ring-color": "var(--cm-accent)",
              } as React.CSSProperties}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium" style={{ color: "var(--cm-text-secondary)" }}>
              Message
            </label>
            <textarea
              required
              rows={8}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                background: "var(--cm-input-bg)",
                borderColor: "var(--cm-input-border)",
                color: "var(--cm-text-primary)",
                "--tw-ring-color": "var(--cm-accent)",
              } as React.CSSProperties}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t pt-4" style={{ borderColor: "var(--cm-border)" }}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
            style={{
              borderColor: "var(--cm-border)",
              color: "var(--cm-text-secondary)",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-w-[120px] items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-70"
            style={{ background: "var(--cm-accent)" }}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send size={14} />
                Send Reminder
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
