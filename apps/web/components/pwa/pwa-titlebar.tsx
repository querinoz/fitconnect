"use client";

/** Window Controls Overlay brand strip for installed PWA (Windows / Edge). */
export function PwaTitlebar() {
  return (
    <div className="pwa-titlebar" aria-hidden>
      <span className="pwa-titlebar__brand">
        FIT<span className="text-eos-voltline">CONNECT</span>
      </span>
    </div>
  );
}
