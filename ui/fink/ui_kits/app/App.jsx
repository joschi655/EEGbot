/* fink app — root flow: landing → login → app */

function App() {
  const [stage, setStage] = React.useState('landing'); // 'landing' | 'login' | 'app'
  const [screen, setScreen] = React.useState('dashboard');
  const [asset, setAsset] = React.useState(null);

  const openAsset = (a) => { setAsset(a); setScreen('asset'); };
  const nav = (s) => { if (s === 'logout') { setStage('landing'); return; } setScreen(s); };

  if (stage === 'landing') return <Landing onLogin={() => setStage('login')} />;
  if (stage === 'login') return <Login onSignIn={() => { setStage('app'); setScreen('dashboard'); }} onBack={() => setStage('landing')} />;

  switch (screen) {
    case 'assets':    return <Assets onNav={nav} onOpenAsset={openAsset} />;
    case 'asset':     return <AssetDetail asset={asset} onNav={nav} onBack={() => setScreen('assets')} onDraft={() => setScreen('reports')} />;
    case 'deadlines': return <Deadlines onNav={nav} />;
    case 'reports':   return <Reports onNav={nav} />;
    case 'dashboard':
    default:          return <Dashboard onNav={nav} onOpenAsset={openAsset} />;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
setTimeout(() => window.lucide && lucide.createIcons(), 40);
