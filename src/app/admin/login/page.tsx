import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";
import "./login.css";

export const metadata: Metadata = {
  title: "Login Admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const from = params.from || "/admin";

  return (
    <div className="iq-login">
      <div className="iq-login__inner">
        <div className="iq-login__brand">
          <h1>Masjid Al-Furqon</h1>
          <p>Panel Administrasi</p>
        </div>

        <div className="iq-login__card">
          <h2>Masuk</h2>
          <LoginForm from={from} />
        </div>

        <p className="iq-login__note">Hanya untuk pengurus yang berwenang</p>
      </div>
    </div>
  );
}
