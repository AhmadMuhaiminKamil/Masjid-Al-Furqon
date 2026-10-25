import "./loading.css";

/**
 * Loading UI global — muncul instan saat pindah halaman,
 * jadi user langsung dapat feedback tanpa jeda kosong.
 */
export default function Loading() {
  return (
    <>
      <div className="iq-route-loading" />
      <div className="iq-skel" aria-hidden="true">
        <div className="iq-skel__bar iq-skel__bar--sm" />
        <div className="iq-skel__bar iq-skel__bar--lg" />
        <div className="iq-skel__bar iq-skel__bar--md" />
        <div className="iq-skel__grid">
          <div className="iq-skel__card" />
          <div className="iq-skel__card" />
          <div className="iq-skel__card" />
        </div>
      </div>
    </>
  );
}
