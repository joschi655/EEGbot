/* fink app — Berichte / fink Assistent (AI report drafting) */

function Msg({ m }) {
  return (
    <div className="fk-msg">
      <span className={`fk-msg__av fk-msg__av--${m.from}`}>
        {m.from === 'fink' ? <i data-lucide="sparkles"></i> : 'LB'}
      </span>
      <div className="fk-msg__body">
        <div className="fk-msg__who">{m.from === 'fink' ? 'fink' : 'Lena Brandt'}</div>
        <div className="fk-msg__text">
          {m.text.map((p, i) => <p key={i}>{p}</p>)}
          {m.draft && (
            <div className="fk-draft">
              <div className="fk-draft__h"><i data-lucide="file-text"></i> {m.draft.title}</div>
              <div className="fk-draft__b">
                <h4>{m.draft.heading}</h4>
                {m.draft.body}
                <div className="fk-cites">
                  {m.draft.cites.map((c, i) => <span className="cite" key={i}>{c}</span>)}
                </div>
              </div>
            </div>
          )}
          {m.cites && <div className="fk-cites">{m.cites.map((c, i) => <span className="cite" key={i}>{c}</span>)}</div>}
        </div>
      </div>
    </div>
  );
}

const SEED = [
  { from: 'fink', text: ['Guten Morgen, Lena. Ich habe das Portfolio über Nacht gegen das EEG 2023 geprüft.', 'Für Windpark Nordsee II sind zwei Meldungen überfällig. Soll ich die MaStR-Aktualisierung als Entwurf vorbereiten?'] },
  { from: 'user', text: ['Ja, bitte. Erstelle den Entwurf für die Quartalsmeldung von Solarpark Lausitz.'] },
  { from: 'fink', text: ['Entwurf erstellt. Grundlage sind die Einspeisemengen aus dem Netzbetreiber-Export Q2 2026.'],
    draft: {
      title: 'Quartalsmeldung Q2 2026 — Solarpark Lausitz',
      heading: 'Eingespeiste Strommenge nach § 71 EEG 2023',
      body: 'Im Zeitraum 01.04.–30.06.2026 wurden 3.184 MWh eingespeist. Die Mengen sind viertelstundenscharf belegt und stimmen mit den Zählerständen des Netzbetreibers überein. Die Meldung ist fristgerecht zum 31.07.2026 an das Marktstammdatenregister zu übermitteln.',
      cites: ['§ 71 EEG 2023', 'MaStR-Nr. SEE901134', 'Netzbetreiber-Export Q2'],
    } },
];

function Reports({ onNav }) {
  const { Button, IconButton, Badge } = window.FinkDesignSystem_4f2014;
  const [msgs, setMsgs] = React.useState(SEED);
  const [draft, setDraft] = React.useState('');
  const streamRef = React.useRef(null);
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });
  React.useEffect(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; }, [msgs]);

  const send = (text) => {
    const t = (text || draft).trim();
    if (!t) return;
    setMsgs((m) => [...m, { from: 'user', text: [t] }]);
    setDraft('');
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'fink',
        text: ['Ich habe die relevanten Pflichten geprüft und eine Antwort mit Belegstellen zusammengestellt.'],
        cites: ['§ 19 EEG 2023', '§ 21c EEG 2023', 'Clearingstelle EEG'] }]);
    }, 650);
  };

  return (
    <AppShell active="reports" onNav={onNav} search={false} title="fink Assistent" subtitle="EEG-Recherche & Berichtsentwürfe"
      actions={<Badge tone="info" icon={<i data-lucide="shield-check"></i>}>Quellen belegt</Badge>}>
      <div className="fk-main" style={{ minHeight: 0 }}>
        <div className="fk-ai__stream" ref={streamRef}>
          <div className="fk-ai__wrap">
            {msgs.map((m, i) => <Msg key={i} m={m} />)}
          </div>
        </div>
        <div className="fk-ai__composer">
          <div className="fk-ai__inputwrap">
            <textarea rows={1} value={draft} placeholder="fink nach einer Pflicht, Frist oder einem § fragen…"
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <Button iconLeft={<i data-lucide="arrow-up"></i>} onClick={() => send()}>Senden</Button>
          </div>
          <div className="fk-ai__suggest">
            {['Welche Fristen laufen diese Woche ab?', 'Erkläre § 21c EEG', 'Entwurf für MaStR-Aktualisierung'].map((s) => (
              <button className="fk-chip" key={s} onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { Reports });
