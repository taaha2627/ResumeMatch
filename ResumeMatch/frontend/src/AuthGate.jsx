
import { useEffect, useState } from "react";
import App from "./App.jsx";
import Auth from "./Auth.jsx";
import { supabase } from "./supabase";
import "./AuthGate.css";

export default function AuthGate() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (active) {
          setSession(data.session);
        }
      } catch (err) {
        if (active) {
          setAuthError(err.message || "Could not check your login session.");
        }
      } finally {
        if (active) {
          setCheckingSession(false);
        }
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (active) {
        setSession(newSession);
        setAuthError("");
        setCheckingSession(false);
      }
    });

    loadSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    setAuthError("");

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setSession(null);
    } catch (err) {
      setAuthError(err.message || "Could not sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="auth-gate-loading">
        <div className="auth-gate-loader" />
        <h2>ResumeMatch</h2>
        <p>Preparing your career workspace...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <div className="auth-gate-login">
        {authError && (
          <p className="auth-gate-error" role="alert">
            {authError}
          </p>
        )}
        <Auth />
      </div>
    );
  }

  return (
    <div className="authenticated-app">
      <div className="auth-gate-toolbar">
        <span className="auth-gate-user">
          Signed in as {session.user.email || "your account"}
        </span>

        <button
          type="button"
          className="auth-gate-logout"
          onClick={handleLogout}
          disabled={signingOut}
        >
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {authError && (
        <p className="auth-gate-error auth-gate-session-error" role="alert">
          {authError}
        </p>
      )}

      <App />
    </div>
  );
}
