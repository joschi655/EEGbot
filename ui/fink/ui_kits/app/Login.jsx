/* fink app — Login / landing (hero video) */

function Login({ onSignIn, onBack }) {
  const { Input, Button, Checkbox } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });

  return (
    <div className="fk-login">
      <div className="fk-hero">
        <div className="fk-hero__mark">fink</div>
        <img className="fk-hero__papers" src="../../assets/media/fink-papers-white.png?v=1" alt="" />
        <div className="fk-hero__content">
          <div className="fk-hero__eyebrow">Für Kanzleien &amp; Compliance-Teams</div>
          <div className="fk-hero__quote">Die Regulierung ändert sich. Ihre Nachweise bleiben lückenlos.</div>
        </div>
      </div>

      <div className="fk-login__form">
        <button type="button" className="fk-login__back" onClick={onBack}>Zurück</button>
        <form className="fk-login__fields" onSubmit={(e) => { e.preventDefault(); onSignIn(); }}>
          <Input label="E-Mail" type="email" defaultValue="lena.brandt@klima-energie.de" iconLeft={<i data-lucide="mail"></i>} />
          <Input label="Passwort" type="password" defaultValue="............" iconLeft={<i data-lucide="lock"></i>} />
          <div className="fk-spread" style={{ marginTop: '2px' }}>
            <Checkbox label="Angemeldet bleiben" defaultChecked />
            <a href="#" className="loop-link" onClick={(e) => e.preventDefault()}>Passwort vergessen?</a>
          </div>
          <Button size="lg" fullWidth type="submit" className="login-cta" iconRight={<i data-lucide="arrow-right"></i>}>Anmelden</Button>
          <Button size="lg" variant="secondary" type="button" className="login-sso" onClick={onSignIn}>Mit SSO anmelden</Button>
        </form>
        <p className="fk-login__meta">Geschützter Bereich · DSGVO-konform · Hosting in der EU</p>
      </div>
    </div>
  );
}

Object.assign(window, { Login });
