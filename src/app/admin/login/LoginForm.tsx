"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";

export function LoginForm({ from }: { from: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("from", from);

    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(from);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="iq-lform">
      {error && <div className="iq-error">{error}</div>}

      <div className="iq-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          placeholder="admin@masjidalfurqon.id"
        />
      </div>

      <div className="iq-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="********"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Memproses..." : "Masuk ke Dashboard"}
      </button>
    </form>
  );
}
