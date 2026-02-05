import { useState } from 'react';

function TelaLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    if (res.ok) {
      const data = await res.json();
      onLoginSuccess(data.usuario);
    } else {
      alert("⚠️ E-mail ou senha incorretos!");
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#081f44' }}>
      <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '350px', textAlign: 'center' }}>
        <h1 style={{ color: '#081f44', marginBottom: '20px' }}>PRISMA ERP <span style={{color:'#ffc817'}}>PRO</span></h1>
        <div style={{ textAlign: 'left', marginBottom: '15px' }}>
          <label>E-mail</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '10px' }} required />
        </div>
        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
          <label>Senha</label>
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)} style={{ width: '100%', padding: '10px' }} required />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>ENTRAR NO SISTEMA</button>
        <p style={{marginTop:'20px', fontSize:'11px', color:'#777'}}>Admin: admin@prisma.com / Senha: 123</p>
      </form>
    </div>
  );
}

export default TelaLogin;