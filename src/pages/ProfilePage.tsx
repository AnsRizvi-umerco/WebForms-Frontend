

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Mail, Phone, Settings as SettingsIcon, FileText, CalendarClock, Clock, Hash } from "lucide-react";
import { Loader } from "@/components/umerco/Loader";
import { LoadingBlock } from "@/components/umerco/LoadingBlock";
import { UmercoSectionLabel } from "@/components/umerco/UmercoSectionLabel";
import { useToast } from "@/components/umerco/toast";
import { btnSecondary, card, cardAccent, statusPill } from "@/components/umerco/styles";
import { getSupabase } from "@/lib/supabase";
import { apiRoutes, http } from "@/api";

type ProfileStats = {
  totalSubmissions: number;
  submissionsThisMonth: number;
  schedulesReceived: number;
  lastActiveAt: string | null;
};

type ProfileData = {
  id: string;
  code: string;
  name: string;
  status: string;
  language: string;
  memberSince: string | null;
  phone: string | null;
  authEmail: string;
  lastSignInAt: string | null;
  stats: ProfileStats;
};

const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "العربية"
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function statusLabel(status: string): string {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code.toUpperCase();
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center gap-2 text-umerco-muted">
        {icon}
        <p className="umerco-section-label">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-semibold text-umerco-dark">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  children,
  mono
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-umerco-border py-2.5 last:border-b-0">
      <dt className="text-sm text-umerco-muted">{label}</dt>
      <dd className={`text-sm text-umerco-dark ${mono ? "font-mono" : ""}`}>{children}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const supabase = getSupabase();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await http.get(apiRoutes.profile);
        if (cancelled) return;
        if (!res.ok) {
          const message = "Could not load your profile.";
          setError(message);
          toast.error(message);
          return;
        }
        setProfile((await res.json()) as ProfileData);
      } catch {
        if (!cancelled) {
          const message = "Could not load your profile.";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const onLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="relative mx-auto flex min-h-[calc(100dvh-9.5rem)] w-full max-w-6xl items-center justify-center px-8">
        <LoadingBlock message="Loading profile…" size="md" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto w-full max-w-5xl py-6">
        <UmercoSectionLabel>Profile</UmercoSectionLabel>
        <h2 className="mt-1 mb-4 text-xl font-semibold text-umerco-dark">Profile</h2>
        <div className="rounded-md border border-umerco-border bg-umerco-beige px-4 py-3 text-sm text-umerco-dark">
          {error ?? "Could not load your profile."}
        </div>
      </div>
    );
  }

  const { stats } = profile;

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-col gap-4 py-6">
      <div>
        <UmercoSectionLabel>Profile</UmercoSectionLabel>
        <h2 className="mt-1 text-xl font-semibold text-umerco-dark">Profile</h2>
      </div>

      {/* Header card */}
      <div className={`${cardAccent} p-5`}>
        <div className="flex flex-wrap items-center gap-4">
          <div className="surface-dark flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-semibold">
            {initials(profile.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-umerco-dark">{profile.name || "—"}</h3>
              <span className={statusPill(profile.status)}>{statusLabel(profile.status)}</span>
            </div>
            <p className="mt-1 font-mono text-sm text-umerco-muted">{profile.code}</p>
            <p className="mt-1 text-xs text-umerco-muted">
              Member since {formatDate(profile.memberSince)} · {languageLabel(profile.language)}
            </p>
          </div>
          <Link to="/settings" className={`${btnSecondary} inline-flex items-center gap-2`}>
            <SettingsIcon size={16} strokeWidth={1.75} />
            Edit in Settings
          </Link>
        </div>
      </div>

      {/* Activity summary */}
      <div>
        <UmercoSectionLabel>Activity</UmercoSectionLabel>
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Submissions"
            value={String(stats.totalSubmissions)}
            icon={<FileText size={16} strokeWidth={1.75} />}
          />
          <StatCard
            label="This Month"
            value={String(stats.submissionsThisMonth)}
            icon={<FileText size={16} strokeWidth={1.75} />}
          />
          <StatCard
            label="Schedules Received"
            value={String(stats.schedulesReceived)}
            icon={<CalendarClock size={16} strokeWidth={1.75} />}
          />
          <StatCard
            label="Last Active"
            value={formatDate(stats.lastActiveAt)}
            icon={<Clock size={16} strokeWidth={1.75} />}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Contact */}
        <div className={`${card} p-5`}>
          <UmercoSectionLabel>Contact Information</UmercoSectionLabel>
          <dl className="mt-3">
            <DetailRow label="Email">
              <span className="inline-flex items-center gap-2">
                <Mail size={14} strokeWidth={1.75} className="text-umerco-muted" />
                {profile.authEmail || "—"}
              </span>
            </DetailRow>
            <DetailRow label="Phone">
              <span className="inline-flex items-center gap-2">
                <Phone size={14} strokeWidth={1.75} className="text-umerco-muted" />
                {profile.phone?.trim() || "Not set"}
              </span>
            </DetailRow>
          </dl>
          <p className="mt-3 text-xs text-umerco-muted">
            Update contact details in{" "}
            <Link to="/settings" className="underline hover:text-umerco-dark">
              Settings
            </Link>
            .
          </p>
        </div>

        {/* Account details */}
        <div className={`${card} p-5`}>
          <UmercoSectionLabel>Account Details</UmercoSectionLabel>
          <dl className="mt-3">
            <DetailRow label="Status">{statusLabel(profile.status)}</DetailRow>
            <DetailRow label="Supplier Code" mono>
              {profile.code}
            </DetailRow>
            <DetailRow label="Language">{languageLabel(profile.language)}</DetailRow>
            <DetailRow label="Member Since">{formatDate(profile.memberSince)}</DetailRow>
            <DetailRow label="Last Sign In">{formatDateTime(profile.lastSignInAt)}</DetailRow>
            <DetailRow label="Account ID" mono>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <Hash size={12} strokeWidth={1.75} className="text-umerco-muted" />
                {profile.id}
              </span>
            </DetailRow>
          </dl>
        </div>
      </div>

      {/* Quick actions */}
      <div className={`${card} p-5`}>
        <UmercoSectionLabel>Quick Actions</UmercoSectionLabel>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link to="/settings" className={`${btnSecondary} inline-flex items-center gap-2`}>
            <SettingsIcon size={16} strokeWidth={1.75} />
            Go to Settings
          </Link>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loggingOut ? <Loader size="sm" className="!w-4" /> : null}
            {loggingOut ? "Signing out…" : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}
