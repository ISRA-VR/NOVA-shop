export default function Footer() {
  return (
    <footer className="tienda-footer">
      <div className="tienda-footer__inner">
        <div><p className="tienda-footer__brand">NOVA<span>·</span>market</p><p className="tienda-footer__copy">Una selección con intención para todos los días.</p></div>
        <div className="tienda-footer__links"><span>Hecho con curiosidad</span><span aria-hidden="true">✦</span><span>© {new Date().getFullYear()} Nova Market</span></div>
      </div>
    </footer>
  );
}
