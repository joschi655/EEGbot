/* fink app — Anlagen-Detail (single asset) */

function ObligationItem({ o, onDraft }) {
  const { Badge, Button, Tag } = window.FinkDesignSystem_4f2014;
  return (
    <div className="fk-obl">
      <span className={`fk-obl__check ${o.done ? 'is-done' : ''}`}>
        <i data-lucide={o.done ? 'check' : 'clock'}></i>
      </span>
      <div className="fk-obl__body">
        <div className="fk-row" style={{ gap: '8px' }}>
          <span className="fk-obl__title">{o.title}</span>
          <Tag>{o.ref}</Tag>
        </div>
        <div className="fk-obl__detail">{o.detail}</div>
      </div>
      <div className="fk-obl__action">
        {o.done
          ? <Badge tone="compliant">Erfüllt</Badge>
          : <Button size="sm" variant="accentSoft" iconLeft={<i data-lucide="sparkles"></i>} onClick={onDraft}>Entwurf prüfen</Button>}
      </div>
    </div>
  );
}

function Fact({ k, v }) {
  return <div className="fk-fact"><span className="fk-fact__k">{k}</span><span className="fk-fact__v">{v}</span></div>;
}

function AssetDetail({ asset, onNav, onBack, onDraft }) {
  const a = asset || window.FINK_DATA.assets[0];
  const D = window.FINK_DATA;
  const { Card, Badge, Button, ProgressBar, IconButton } = window.FinkDesignSystem_4f2014;
  React.useEffect(() => { setTimeout(() => window.lucide && lucide.createIcons(), 10); });
  const doneCount = D.obligations.filter((o) => o.done).length;

  return (
    <AppShell active="asset" onNav={onNav} title="Anlagen-Detail" subtitle={a.name}
      actions={<Button iconLeft={<i data-lucide="file-text"></i>} onClick={() => onNav('reports')}>Bericht erstellen</Button>}>
      <div className="fk-screen">
        <div className="fk-screen__inner">

          <button className="fk-back" onClick={onBack}><i data-lucide="arrow-left"></i> Zurück zu Anlagen</button>

          <div className="fk-detail-head">
            <div className="fk-row" style={{ gap: '14px' }}>
              <span className="fk-detail-ic"><i data-lucide={window.TECH_ICON[a.tech]}></i></span>
              <div>
                <h1>{a.name}</h1>
                <div className="fk-muted" style={{ fontSize: '13px', marginTop: '2px' }}>
                  <span className="fink-mono">{a.id}</span> · {a.power} · {a.region}
                </div>
              </div>
            </div>
            <Badge tone={window.STATUS_TONE[a.status]} size="lg">{window.STATUS_LABEL[a.status]}</Badge>
          </div>

          <div className="fk-grid fk-grid--2">
            <Card title="Meldepflichten" subtitle={`${doneCount} von ${D.obligations.length} erfüllt · von fink geprüft`}
              headerAction={<ProgressBar value={doneCount} max={D.obligations.length} showValue={false} tone="compliant" style={{ width: '120px' }} />}>
              <div className="fk-obls">
                {D.obligations.map((o, i) => <ObligationItem key={i} o={o} onDraft={onDraft} />)}
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Card title="Stammdaten">
                <div className="fk-facts">
                  <Fact k="MaStR-Nummer" v={<span className="fink-mono">{a.id}</span>} />
                  <Fact k="Technologie" v={a.tech === 'pv' ? 'Photovoltaik' : a.tech === 'wind' ? 'Windkraft' : 'Biogas'} />
                  <Fact k="Leistung" v={a.power} />
                  <Fact k="Standort" v={a.region} />
                  <Fact k="Inbetriebnahme" v="14.03.2022" />
                  <Fact k="Vergütungsart" v="Direktvermarktung" />
                </div>
              </Card>
              <Card title="Dokumente" headerAction={<IconButton label="Hochladen" icon={<i data-lucide="upload"></i>} />}>
                <div className="fk-docs">
                  <div className="fk-doc"><i data-lucide="file-text"></i><span>Quartalsmeldung_Q1_2026.pdf</span><span className="fk-muted">2,1 MB</span></div>
                  <div className="fk-doc"><i data-lucide="file-text"></i><span>EEG-Umlage_Nachweis_2025.pdf</span><span className="fk-muted">880 KB</span></div>
                  <div className="fk-doc"><i data-lucide="file-spreadsheet"></i><span>Einspeisemengen_2025.xlsx</span><span className="fk-muted">340 KB</span></div>
                </div>
              </Card>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}

Object.assign(window, { AssetDetail });
