import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { LifeBuoy, X } from "lucide-react";
import { useToast } from "@/components/umerco/toast";
import { btnDark, btnOutline } from "@/components/umerco/styles";

const ISSUE_CATEGORIES = [
  "page_not_loading",
  "form_submit_failed",
  "data_incorrect",
  "login_access",
  "other"
] as const;

const ANIMATION_MS = 280;

type IssueCategory = (typeof ISSUE_CATEGORIES)[number];

type FormState = {
  category: IssueCategory;
  title: string;
  description: string;
  contactEmail: string;
};

type ReportIssueWidgetProps = {
  /** Prefill issue type — useful on login when access problems are most common. */
  defaultCategory?: IssueCategory;
};

function makeInitialForm(category: IssueCategory = "page_not_loading"): FormState {
  return {
    category,
    title: "",
    description: "",
    contactEmail: ""
  };
}

export function ReportIssueWidget({
  defaultCategory = "page_not_loading"
}: ReportIssueWidgetProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const titleId = useId();
  const closeTimer = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState<FormState>(() => makeInitialForm(defaultCategory));
  const [submitting, setSubmitting] = useState(false);

  const open = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setMounted(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setVisible(true));
    });
  };

  const close = () => {
    setVisible(false);
    if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
      closeTimer.current = null;
    }, ANIMATION_MS);
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current != null) window.clearTimeout(closeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mounted]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      toast.error(t("reportIssue.validation"));
      return;
    }

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setForm(makeInitialForm(defaultCategory));
      close();
      toast.success(t("reportIssue.success"));
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        className="fixed bottom-6 end-0 z-40 flex items-center gap-2 rounded-s-full border border-umerco-border bg-umerco-dark py-3 pe-4 ps-4 text-sm font-semibold text-white shadow-lg transition hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-umerco-primary"
        aria-expanded={visible}
        aria-controls="report-issue-drawer"
        onClick={open}
      >
        <LifeBuoy size={18} strokeWidth={1.75} />
        <span className="hidden sm:inline">{t("reportIssue.fab")}</span>
      </button>

      {mounted ? (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <button
            type="button"
            className={`absolute inset-0 bg-gray-900/50 backdrop-blur-[1px] transition-opacity duration-300 ease-out ${
              visible ? "opacity-100" : "opacity-0"
            }`}
            aria-label={t("reportIssue.close")}
            onClick={close}
          />

          <aside
            id="report-issue-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${
              visible
                ? "translate-x-0"
                : "translate-x-full rtl:-translate-x-full"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b border-umerco-border px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-umerco-muted">
                  {t("reportIssue.eyebrow")}
                </p>
                <h2 id={titleId} className="mt-1 text-lg font-semibold text-umerco-dark">
                  {t("reportIssue.title")}
                </h2>
                <p className="mt-1 text-sm text-umerco-muted">{t("reportIssue.subtitle")}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-umerco-muted transition hover:bg-umerco-beige hover:text-umerco-dark"
                aria-label={t("reportIssue.close")}
                onClick={close}
              >
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <form className="flex min-h-0 flex-1 flex-col" onSubmit={onSubmit}>
              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-umerco-dark">
                    {t("reportIssue.category")}
                  </span>
                  <select
                    className="umerco-input w-full rounded-lg border border-umerco-border bg-white px-3 py-2.5 text-sm text-umerco-dark"
                    value={form.category}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        category: e.target.value as IssueCategory
                      }))
                    }
                  >
                    {ISSUE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {t(`reportIssue.categories.${category}`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-umerco-dark">
                    {t("reportIssue.subject")}
                  </span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                    placeholder={t("reportIssue.subjectPlaceholder")}
                    className="umerco-input w-full rounded-lg border border-umerco-border bg-white px-3 py-2.5 text-sm text-umerco-dark placeholder:text-umerco-muted"
                    maxLength={120}
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-umerco-dark">
                    {t("reportIssue.description")}
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, description: e.target.value }))
                    }
                    placeholder={t("reportIssue.descriptionPlaceholder")}
                    className="umerco-input min-h-[9rem] w-full resize-y rounded-lg border border-umerco-border bg-white px-3 py-2.5 text-sm text-umerco-dark placeholder:text-umerco-muted"
                    required
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-umerco-dark">
                    {t("reportIssue.contactEmail")}{" "}
                    <span className="font-normal text-umerco-muted">
                      ({t("reportIssue.optional")})
                    </span>
                  </span>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) =>
                      setForm((current) => ({ ...current, contactEmail: e.target.value }))
                    }
                    placeholder={t("reportIssue.contactEmailPlaceholder")}
                    className="umerco-input w-full rounded-lg border border-umerco-border bg-white px-3 py-2.5 text-sm text-umerco-dark placeholder:text-umerco-muted"
                  />
                </label>

                <div className="rounded-lg border border-umerco-primary/20 bg-umerco-primary-soft/40 px-3 py-3 text-sm text-umerco-muted">
                  {t("reportIssue.note")}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-umerco-border px-5 py-4">
                <button type="button" className={`${btnOutline} px-4`} onClick={close}>
                  {t("reportIssue.cancel")}
                </button>
                <button type="submit" className={`${btnDark} px-4`} disabled={submitting}>
                  {submitting ? t("reportIssue.sending") : t("reportIssue.submit")}
                </button>
              </div>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}
