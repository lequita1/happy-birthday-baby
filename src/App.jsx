import { useState } from 'react';
import CountdownGate from './components/CountdownGate';

function App() {
  const [unlocked, setUnlocked] = useState(false);

  return unlocked ? (
    <div>Scene 2 goes here</div>
  ) : (
    <CountdownGate onUnlock={() => setUnlocked(true)} />
  );
}

export default App;