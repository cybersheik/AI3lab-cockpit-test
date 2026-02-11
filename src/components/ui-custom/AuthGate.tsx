import { useState, useEffect } from 'react';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('ai3lab-auth') === 'ok') setAuthed(true);
  }, []);

  if (authed) return <>{children}</>;

  return (
    <div style={{ background: '#0A0E17', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: '#6C56FF', fontSize: 24, marginBottom: 16, fontWeight: 'bold' }}>AI³Lab</div>
        <input
          type="password"
          placeholder="Access code"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && input === 'ai3lab') {
              sessionStorage.setItem('ai3lab-auth', 'ok');
              setAuthed(true);
            }
          }}
          style={{ background: '#1a1f2e', border: '1px solid #333', borderRadius: 8, padding: '10px 16px', color: 'white', fontSize: 16, outline: 'none' }}
        />
      </div>
    </div>
  );
}
