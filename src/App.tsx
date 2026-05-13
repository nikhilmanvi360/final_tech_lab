import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, ReactNode, lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Toaster } from "sonner";
import { InvestigationBoard } from "./pages/InvestigationBoard";
import { BlackMarket } from "./pages/BlackMarket";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminRound3 } from "./pages/admin/AdminRound3";

import { AdminSystem } from "./pages/admin/AdminSystem";
import { AdminManifest } from "./pages/admin/AdminManifest";
import { AdminTeams } from "./pages/admin/AdminTeams";
import { AdminCaseBuilder } from "./pages/admin/AdminCaseBuilder";
import { api } from "./services/api";
import { authService } from "./services/authService";

const Round0Page = lazy(() => import("./pages/round0/Round0Page").then(m => ({ default: m.Round0Page })));
const Round1Page = lazy(() => import("./pages/round1/Round1Page").then(m => ({ default: m.Round1Page })));
const Round2Page = lazy(() => import("./pages/round2/Round2Page").then(m => ({ default: m.Round2Page })));
const Round3Page = lazy(() => import("./pages/round3/Round3Page").then(m => ({ default: m.Round3Page })));

function RequireAdmin({
  session,
  children,
}: {
  session: any;
  children: ReactNode;
}) {
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== "admin") return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Firebase Auth Listener (Primary)
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      if (user) {
        try {
          const profile = await authService.getTeamProfile(user.uid);
          const storedRole = localStorage.getItem("playerRole") || "1st Year Student (Field Agent)";
          setSession({
            id: user.uid,
            name: profile?.name || "Unknown Team",
            role: profile?.role || "detective",
            score: profile?.score || 0,
            playerRole: storedRole
          });
          setLoading(false);
          return;
        } catch (e) {
          console.error("Firebase session recovery failed", e);
        }
      }

      // 2. REST Fallback (If no Firebase user or Firebase fails)
      api
        .get<any>("/api/auth/me")
        .then((data) => {
          if (data.team) {
            const storedRole =
              localStorage.getItem("playerRole") ||
              "1st Year Student (Field Agent)";
            setSession({ ...data.team, playerRole: storedRole });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gold"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster richColors position="top-right" theme="dark" />
      <Routes>
        <Route
          path="/login"
          element={
            session ? <Navigate to="/" /> : <Login onLogin={setSession} />
          }
        />

        <Route
          element={
            session ? (
              <Layout team={session} onLogout={() => setSession(null)} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/" element={<InvestigationBoard />} />
          <Route path="/round0" element={<Suspense fallback={<div className="p-8 text-gold animate-pulse">Loading core assets...</div>}><Round0Page /></Suspense>} />
          <Route path="/round1" element={<Suspense fallback={<div className="p-8 text-gold animate-pulse">Loading database modules...</div>}><Round1Page /></Suspense>} />
          <Route path="/round2" element={<Suspense fallback={<div className="p-8 text-gold animate-pulse">Loading forensics toolkit...</div>}><Round2Page /></Suspense>} />
          <Route path="/round3" element={<Suspense fallback={<div className="p-8 text-gold animate-pulse">Loading interrogation interface...</div>}><Round3Page /></Suspense>} />
          <Route path="/blackmarket" element={<BlackMarket />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAdmin session={session}>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="round3" element={<AdminRound3 />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="builder" element={<AdminCaseBuilder />} />
          <Route path="manifest" element={<AdminManifest />} />
          <Route
            path="*"
            element={<div className="p-8">Admin Module Not Built Yet</div>}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
