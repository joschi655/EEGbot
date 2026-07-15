/* EEGbot B2C — Solarspitzen-Check: profilgetriebene Auswertung von § 9,
   §§ 51/51a und § 100 EEG. Keine Ertragsschätzung: Der Screen zeigt nur
   deterministisch ableitbare Technik- und Vergütungsfolgen. */

const SS_VERMARKTUNG = {
  einspeiseverguetung: 'Einspeisevergütung',
  marktpraemie: 'Marktprämie / Direktvermarktung',
  mieterstromzuschlag: 'Mieterstromzuschlag',
  keine_eeg_foerderung: 'Keine EEG-Förderung',
};

function SsStatus({ tone, children }) {
  const { Badge } = window.FinkDesignSystem_4f2014;
  return <Badge tone={tone} size="lg">{children}</Badge>;
}

function SsWarnung({ text }) {
  return (
    <div style={{ padding: '10px 14px', border: '1px solid var(--border-subtle)', borderLeft: '3px solid #C6291F', borderRadius: 'var(--radius-md)', font: 'var(--font-body)', color: 'var(--text-primary)' }}>
      {text}
    </div>
  );
}

function SsErgebnis({ d, profil, onNav }) {
  const { Card, Button, Badge } = window.FinkDesignSystem_4f2014;
  const t = d.technische_vorgabe;
  const n = d.negative_preise;
  const technikLabel = t.status === 'begrenzt' ? '60 % Begrenzung' : t.status === 'steuerbar' ? 'Steuerbar' : t.status === 'befreit' ? 'Ausgenommen' : t.status === 'vorschau' ? 'Vorschau' : 'Bestandsregime';
  const technikTone = t.status === 'steuerbar' || t.status === 'befreit' ? 'compliant' : t.status === 'begrenzt' || t.status === 'zwischenloesung' ? 'pending' : 'neutral';
  const negativLabel = n.status === 'gilt' ? '§ 51 gilt' : n.status === 'noch_ausgenommen' ? 'Noch ausgenommen' : n.status === 'altregime_pruefen' ? 'Altregime prüfen' : n.status === 'vorschau' ? 'Vorschau' : 'Nicht relevant';
  const negativTone = n.status === 'gilt' || n.status === 'altregime_pruefen' ? 'pending' : n.status === 'noch_ausgenommen' ? 'neutral' : 'compliant';

  return (
    <React.Fragment>
      {d.warnungen.map((w, i) => <SsWarnung key={i} text={w} />)}
      <div className="fk-result-grid" style={{ marginBottom: 18 }}>
        <Card title="Technische Vorgabe" subtitle="§ 9 EEG bis zum erfolgreichen Netzbetreiber-Test">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <SsStatus tone={technikTone}>{technikLabel}</SsStatus>
            {t.max_einspeisung_kw != null && (
              <div data-testid="solarspitzen-max">
                <span style={{ font: 'var(--weight-bold) 36px/1 var(--font-sans)', color: 'var(--klein-600)' }}>{Number(t.max_einspeisung_kw).toLocaleString('de-DE')}</span>
                <span style={{ font: 'var(--font-body)', color: 'var(--text-muted)', marginLeft: 6 }}>kW maximale Wirkleistungseinspeisung</span>
              </div>
            )}
            <p style={{ font: 'var(--font-body)', color: 'var(--text-primary)', margin: 0 }}>{t.aussage}</p>
            {t.handlung && <p style={{ font: 'var(--font-caption)', color: 'var(--klein-600)', margin: 0 }}><strong>Handlung:</strong> {t.handlung}</p>}
          </div>
        </Card>

        <Card title="Negative Strompreise" subtitle="§ 51 EEG — wann der anzulegende Wert null wird">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }} data-testid="solarspitzen-negative">
            <SsStatus tone={negativTone}>{negativLabel}</SsStatus>
            {n.gilt_ab && <div><strong style={{ font: 'var(--font-body)' }}>Gilt ab:</strong> <span style={{ font: 'var(--font-body)' }}>{n.gilt_ab}</span></div>}
            <p style={{ font: 'var(--font-body)', color: 'var(--text-primary)', margin: 0 }}>{n.aussage}</p>
            <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', margin: 0 }}><strong>Schwelle:</strong> {n.ausloeseschwelle}</p>
          </div>
        </Card>

        <Card title="Förderverlängerung" subtitle="§ 51a EEG — Ausgleich am Ende des Förderzeitraums">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Badge tone={d.verlaengerung.anwendbar === true ? 'compliant' : d.verlaengerung.anwendbar === null ? 'pending' : 'neutral'}>
              {d.verlaengerung.anwendbar === true ? 'Zeitkontingent entsteht' : d.verlaengerung.anwendbar === null ? 'Noch zu bestimmen' : 'Aktuell kein Zeitkontingent'}
            </Badge>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-primary)', margin: 0 }}>{d.verlaengerung.aussage}</p>
            <p style={{ font: 'var(--font-caption)', color: 'var(--text-muted)', margin: 0 }}>
              EEGbot schätzt ohne veröffentlichte Negativpreis-Zeitreihe und Abrechnungsdaten bewusst kein Enddatum.
            </p>
          </div>
        </Card>
      </div>

      {d.freiwilliger_wechsel.grundsaetzlich_vorgesehen && (
        <Card title="Freiwilliger Wechsel für Bestandsanlagen" subtitle="§ 100 Abs. 47 i. V. m. § 101 EEG" variant="accent">
          <div className="fk-row" style={{ gap: 12, alignItems: 'flex-start' }}>
            <Badge tone="pending">+{d.freiwilliger_wechsel.bonus_ct_kwh.toLocaleString('de-DE')} ct/kWh vorgesehen</Badge>
            <p style={{ font: 'var(--font-body)', color: 'var(--text-primary)', margin: 0, flex: 1 }}>{d.freiwilliger_wechsel.aussage}</p>
          </div>
        </Card>
      )}

      <div style={{ marginTop: 18 }}>
        <Rechenweg
          inputs={{
            Inbetriebnahme: profil.ibn_datum,
            Leistung_kWp: profil.leistung_kwp,
            Vermarktungsform: SS_VERMARKTUNG[profil.vermarktungsform] || profil.vermarktungsform,
            iMSys: profil.imsys_vorhanden,
            iMSys_Einbau: profil.imsys_einbau_datum || '—',
            Steuerungseinrichtung: profil.steuerungseinrichtung_vorhanden,
            Ansteuerbarkeit_getestet: profil.ansteuerbarkeit_getestet,
          }}
          schritte={d.rechenweg}
          parameterstand={`${d.parameterstand.rechtsstand}; ${d.parameterstand.kleinstanlagen_festlegung}; ${d.parameterstand.freiwilliger_wechsel}`}
          normen={d.normen}
          quellen={d.quellen}
        />
      </div>
      <div style={{ marginTop: 14 }}><Button variant="secondary" onClick={() => onNav('anlage')}>Technikangaben im Profil ändern</Button></div>
    </React.Fragment>
  );
}

function Solarspitzen({ onNav }) {
  const { Card, Button } = window.FinkDesignSystem_4f2014;
  const profil = window.EEGBOT_PROFIL.lade();
  const [ergebnis, setErgebnis] = React.useState(null);
  const [fehler, setFehler] = React.useState(null);

  React.useEffect(() => {
    if (!profil) return;
    fetch('/api/solarspitzen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ibn_datum: profil.ibn_datum,
        leistung_kwp: Number(profil.leistung_kwp),
        ...(profil.anlagentyp ? { anlagentyp: profil.anlagentyp } : {}),
        ...(profil.wechselrichter_va ? { wechselrichter_va: Number(profil.wechselrichter_va) } : {}),
        vermarktungsform: profil.vermarktungsform,
        imsys_vorhanden: !!profil.imsys_vorhanden,
        ...(profil.imsys_einbau_datum ? { imsys_einbau_datum: profil.imsys_einbau_datum } : {}),
        steuerungseinrichtung_vorhanden: !!profil.steuerungseinrichtung_vorhanden,
        ansteuerbarkeit_getestet: !!profil.ansteuerbarkeit_getestet,
      }),
    })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.fehler || `HTTP ${r.status}`); return d; })
      .then(setErgebnis)
      .catch((e) => setFehler(String(e.message || e)));
  }, []);

  return (
    <AppShell active="solarspitzen" onNav={onNav} title="Solarspitzen-Check" subtitle="60-%-Grenze, Steuerbarkeit und negative Strompreise — aus Ihrem Anlagenprofil">
      <div className="fk-screen">
        <div className="fk-screen__inner" style={{ maxWidth: 1120 }}>
          {!profil && (
            <Card title="Keine Anlage erfasst" subtitle="Der Check braucht Inbetriebnahme, Leistung, Vermarktungsform und Technikstatus">
              <Button onClick={() => onNav('anlage')} iconLeft={<i data-lucide="plus"></i>}>Anlage erfassen</Button>
            </Card>
          )}
          {profil && !ergebnis && !fehler && <p style={{ font: 'var(--font-body)', color: 'var(--text-muted)' }}>Prüfe Solarspitzen-Regeln…</p>}
          {fehler && <SsWarnung text={`Fehler: ${fehler}`} />}
          {ergebnis && <SsErgebnis d={ergebnis} profil={profil} onNav={onNav} />}
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Solarspitzen });
