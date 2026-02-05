import { useState, useEffect } from 'react';

function TelaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cargo: 'Vendedor' });

  useEffect(() => { carregar(); }, []);
  const carregar = async () => {
    const res = await fetch('http://localhost:3000/api/usuarios');
    setUsuarios(await res.json());
  };

  const salvar = async () => {
    await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    alert("✅ Novo usuário criado!");
    setForm({ nome: '', email: '', senha: '', cargo: 'Vendedor' });
    carregar();
  };

  return (
    <div className="card-box">
      <h2 className="page-title">⚙️ Gestão de Usuários do Sistema</h2>
      <div className="form-grid" style={{background:'#f8f9fa', padding:'20px', marginBottom:'20px'}}>
        <div className="col-4"><label>Nome</label><input value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} /></div>
        <div className="col-4"><label>E-mail (Login)</label><input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
        <div className="col-2"><label>Senha</label><input type="password" value={form.senha} onChange={e=>setForm({...form, senha:e.target.value})} /></div>
        <div className="col-2"><label>Cargo</label>
          <select value={form.cargo} onChange={e=>setForm({...form, cargo:e.target.value})}>
            <option>Gerente</option><option>Vendedor</option><option>Estoquista</option>
          </select>
        </div>
        <div className="col-12" style={{textAlign:'right'}}><button className="btn btn-primary" onClick={salvar}>➕ Criar Usuário</button></div>
      </div>
      <table>
        <thead><tr><th>Nome</th><th>E-mail</th><th>Cargo</th></tr></thead>
        <tbody>
          {usuarios.map(u => <tr key={u.id}><td>{u.nome}</td><td>{u.email}</td><td>{u.cargo}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default TelaUsuarios;