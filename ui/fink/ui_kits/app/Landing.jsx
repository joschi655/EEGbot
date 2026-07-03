/* fink app — Landing / marketing hero (pre-login)
   Logo top-left, menu top-right, page-filling sketch below. */

function Landing({ onLogin }) {
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  return (
    <div className="lp">
      <header className="lp-head">
        <button className="lp-logo" onClick={() => window.scrollTo(0, 0)} aria-label="fink">fink</button>
        <nav className="lp-menu">
          <a>Über uns</a>
          <a>Produkt</a>
          <a>Für Kanzleien</a>
          <a>Preise</a>
          <a className="lp-menu__login" onClick={onLogin}>Anmelden</a>
        </nav>
      </header>

      <section className="lp-stage">
        <img src="../../assets/media/fink-sketch-ikb.png?v=4" alt="Zwei Juristen prüfen Unterlagen" />
      </section>
    </div>
  );
}

Object.assign(window, { Landing });
