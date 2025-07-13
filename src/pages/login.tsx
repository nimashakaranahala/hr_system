import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      if (data.role === "ADMIN") router.push("/admin");
      else router.push("/employee");
    } else {
      setError(data.error || "Login failed");
    }
  }

  return (
    <>
      <Head>
        <title>Login</title>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </Head>

      <section className="login-bg">
        <div className="content-wrapper">
          <div className="login-form-container">
            <img
              src="/hope_logo.png"
              alt="Company logo"
              className="login-logo"
            />

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="form-outline">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  className="form-control"
                  placeholder="Enter a valid email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-outline">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input me-2"
                    type="checkbox"
                    id="rememberMe"
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <a href="#" className="text-body">
                  Forgot password?
                </a>
              </div>

              {error && <div className="alert alert-danger">{error}</div>}

              <button type="submit" className="btn btn-primary btn-lg w-100">
                Login
              </button>

              <p className="small fw-bold mt-3 mb-0 text-center">
                Do not have an account?{" "}
                <a href="#" className="link-danger">
                  Register
                </a>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
