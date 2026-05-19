/**
 * CSS floating orbs — charltonk.dev WebGL feel without Three.js.
 */
export function OrbsLayer() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="fc-orb fc-orb-a" />
      <div className="fc-orb fc-orb-b" />
      <div className="fc-orb fc-orb-c" />
      <div className="fc-orb fc-orb-d" />
    </div>
  );
}
