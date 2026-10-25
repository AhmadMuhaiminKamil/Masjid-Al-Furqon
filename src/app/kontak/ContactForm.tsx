"use client";

import { useState } from "react";
import { submitContact } from "./actions";

export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSent(false);

    const fd = new FormData(e.currentTarget);
    const res = await submitContact(fd);

    if (res?.error) {
      setError(res.error);
      setPending(false);
      return;
    }

    setSent(true);
    setPending(false);
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSent(false), 6000);
  }

  return (
    <form className="iq-form" onSubmit={handleSubmit}>
      {error && (
        <div
          style={{
            padding: "11px 14px",
            borderRadius: 9,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: ".86rem",
          }}
        >
          {error}
        </div>
      )}
      {sent && (
        <div
          style={{
            padding: "11px 14px",
            borderRadius: 9,
            background: "#e7f5ec",
            border: "1px solid #c6e6d3",
            color: "#16653f",
            fontSize: ".86rem",
          }}
        >
          Terima kasih! Pesan Anda sudah terkirim. Kami akan segera menghubungi.
        </div>
      )}

      <div className="iq-form__row">
        <div className="iq-field">
          <label htmlFor="name">Nama Lengkap</label>
          <input id="name" name="name" type="text" required placeholder="Nama Anda" />
        </div>
        <div className="iq-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="email@contoh.com"
          />
        </div>
      </div>

      <div className="iq-field">
        <label htmlFor="subject">Subjek</label>
        <input id="subject" name="subject" type="text" placeholder="Topik pesan" />
      </div>

      <div className="iq-field">
        <label htmlFor="message">Pesan</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Tulis pesan Anda di sini..."
        />
      </div>

      <button
        type="submit"
        className="iq-btn iq-btn--gold"
        style={{ alignSelf: "flex-start" }}
        disabled={pending}
      >
        {pending ? "Mengirim..." : "Kirim Pesan"}{" "}
        <span className="iq-btn__arrow">&rarr;</span>
      </button>
    </form>
  );
}
