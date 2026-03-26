import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../../firebase";
import "./AuthPage.css";

function AuthPage() {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  const switchMode = (createMode) => {
    setIsCreateMode(createMode);
    setErrorMessage("");
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    const normalizedEmail = email.trim().toLowerCase();

    if (!auth) {
      setErrorMessage("Firebase Authentication is not configured.");
      clearForm();
      return;
    }

    if (isCreateMode && password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      clearForm();
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreateMode) {
        await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }
    } catch (error) {
      const authCode = error?.code ?? "";

      if (authCode === "auth/invalid-credential") {
        setErrorMessage("Invalid email or password.");
      } else if (authCode === "auth/email-already-in-use") {
        setErrorMessage("User already exists.");
      } else if (authCode === "auth/weak-password") {
        setErrorMessage("Password must be at least 6 characters.");
      } else {
        setErrorMessage(error.message ?? "Authentication failed.");
      }
    } finally {
      setIsSubmitting(false);
      clearForm();
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={!isCreateMode}
            className={`auth-tab ${!isCreateMode ? "active" : ""}`}
            onClick={() => switchMode(false)}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isCreateMode}
            className={`auth-tab ${isCreateMode ? "active" : ""}`}
            onClick={() => switchMode(true)}
          >
            Create user
          </button>
        </div>

        <h1 className="auth-title">{isCreateMode ? "Create account" : "Login"}</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@email.com"
              required
            />
          </label>

          <label className="auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {isCreateMode && (
            <label className="auth-field">
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
          )}

          {errorMessage ? <p className="auth-error">{errorMessage}</p> : null}

          <button type="submit" className="auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isCreateMode ? "Create user" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default AuthPage;
