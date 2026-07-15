/* EEGbot app — root flow: landing → app (Login kommt mit Supabase-Accounts) */

function App() {
  const [stage, setStage] = React.useState('landing'); // 'landing' | 'app'
  const [screen, setScreen] = React.useState('dashboard');

  const nav = (s) => { if (s === 'logout') { setStage('landing'); return; } setScreen(s); };

  if (stage === 'landing') return <Landing onStart={() => { setStage('app'); setScreen('dashboard'); }} />;

  switch (screen) {
    case 'anlage':     return <MeineAnlage onNav={nav} />;
    case 'deadlines':  return <Deadlines onNav={nav} />;
    case 'sanktion52': return <Sanktion52 onNav={nav} />;
    case 'verguetung': return <Verguetung onNav={nav} />;
    case 'ue20':       return <Ue20 onNav={nav} />;
    case 'fahrplan':   return <Fahrplan onNav={nav} />;
    case 'recherche':  return <Recherche onNav={nav} />;
    case 'normgraph':  return <NormGraph onNav={nav} />;
    case 'dashboard':
    default:           return <Dashboard onNav={nav} />;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
setTimeout(() => window.lucide && lucide.createIcons(), 40);
