import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { paths } from "@/paths";
import { getSupabase } from "@/lib/supabase";

export function ProtectedRoute() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(Boolean(session));
      setReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(Boolean(session));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  if (!authed) return <Navigate to={paths.login} replace />;
  return <Outlet />;
}
