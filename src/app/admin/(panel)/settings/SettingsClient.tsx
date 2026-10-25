"use client";

import { useState, useTransition } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { saveSettings, type SettingRow } from "./actions";

type FieldDef = {
  key: string;
  label: string;
  hint?: string;
  type?: "text" | "email" | "url" | "textarea";
  placeholder?: string;
};

type GroupDef = {
  title: string;
  desc: string;
  fields: FieldDef[];
};

const GROUPS: GroupDef[] = [
  {
    title: "Identitas Situs",
    desc: "Nama dan tagline masjid yang tampil di navbar, footer, dan judul halaman.",
    fields: [
      { key: "site_name", label: "Nama Masjid", placeholder: "Masjid Al-Furqon" },
      { key: "site_city", label: "Kota", placeholder: "Padang" },
      {
        key: "site_tagline",
        label: "Tagline",
        type: "textarea",
        hint: "Kalimat singkat yang tampil di hero beranda.",
      },
    ],
  },
  {
    title: "Kontak",
    desc: "Informasi kontak yang tampil di halaman Kontak dan footer.",
    fields: [
      { key: "contact_phone", label: "Telepon", placeholder: "+62 21 0000 0000" },
      { key: "contact_email", label: "Email", type: "email", placeholder: "info@masjidalfurqon.id" },
      { key: "contact_hours", label: "Jam Layanan", placeholder: "Senin – Jumat: 08.00 – 16.00 WIB" },
      {
        key: "contact_address",
        label: "Alamat",
        type: "textarea",
        hint: "Alamat lengkap masjid.",
      },
    ],
  },
  {
    title: "Rekening Donasi",
    desc: "Rekening yang ditampilkan di halaman Donasi untuk transfer jamaah.",
    fields: [
      { key: "bank_name", label: "Nama Bank", placeholder: "Bank Syariah Indonesia (BSI)" },
      { key: "bank_account", label: "Nomor Rekening", placeholder: "1234 567 890" },
      { key: "bank_holder", label: "Atas Nama", placeholder: "DKM Masjid Al-Furqon" },
    ],
  },
  {
    title: "Media Sosial",
    desc: "Tautan akun resmi masjid. Isi dengan URL lengkap.",
    fields: [
      { key: "social_instagram", label: "Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { key: "social_facebook", label: "Facebook", type: "url", placeholder: "https://facebook.com/..." },
      { key: "social_youtube", label: "YouTube", type: "url", placeholder: "https://youtube.com/@..." },
    ],
  },
];

export function SettingsClient({ initial }: { initial: SettingRow[] }) {
  const map = new Map(initial.map((s) => [s.key, s.value]));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setSaved(false);

    start(async () => {
      const res = await saveSettings(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="iq-adm-form">
      {error && <div className="iq-adm-savebar iq-adm-savebar--err">{error}</div>}
      {saved && (
        <div className="iq-adm-savebar iq-adm-savebar--ok">
          <CheckCircle2 size={17} />
          Pengaturan berhasil disimpan.
        </div>
      )}

      {GROUPS.map((g) => (
        <div key={g.title} className="iq-adm-card" style={{ padding: "22px 24px" }}>
          <div style={{ marginBottom: 18 }}>
            <h2
              style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: "1.08rem",
                fontWeight: 700,
                color: "#0b3d2c",
                margin: "0 0 4px",
              }}
            >
              {g.title}
            </h2>
            <p style={{ fontSize: ".83rem", color: "#8a978f", margin: 0 }}>{g.desc}</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {g.fields.map((f) => {
              const val = map.get(f.key) ?? "";
              const id = `s_${f.key}`;
              return (
                <div className="iq-adm-field" key={f.key}>
                  <label htmlFor={id}>{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={id}
                      name={id}
                      defaultValue={val}
                      placeholder={f.placeholder}
                      style={{ minHeight: 78 }}
                    />
                  ) : (
                    <input
                      id={id}
                      name={id}
                      type={f.type ?? "text"}
                      defaultValue={val}
                      placeholder={f.placeholder}
                    />
                  )}
                  {f.hint && <span className="hint">{f.hint}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button type="submit" className="iq-btn iq-btn--primary" disabled={pending}>
          <Save size={16} />
          {pending ? "Menyimpan..." : "Simpan Semua Pengaturan"}
        </button>
      </div>
    </form>
  );
}
