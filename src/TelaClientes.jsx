import { useState, useEffect } from 'react';

function TelaClientes() {
  const [clientes, setClientes] = useState([]);
  const [aba, setAba] = useState('lista');
  const [form, setForm] = useState({ nome: '', cpf_cnpj: '', rg: '', telefone: '', whatsapp: '', email: '', endereco_completo: '', foto_url: '' });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const res = await fetch('http://localhost:3000/clientes');
    setClientes(await res.json());
  };

  const salvar = async () => {
    await fetch('http://localhost:3000/clientes', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    alert("✅ Cliente Salvo!");
    setForm({ nome: '', cpf_cnpj: '', rg: '', telefone: '', whatsapp: '', email: '', endereco_completo: '', foto_url: '' });
    setAba('lista');
    carregar();
  };
  const excluir = async (id) => { if(confirm("Apagar?")) { await fetch(`http://localhost:3000/clientes/${id}`, {method:'DELETE'}); carregar(); }};
  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">👥</span> Clientes (CRM)</h2>
      <div style={{marginBottom:'20px'}}><button className="btn" onClick={()=>setAba('lista')}>📋 Lista</button> <button className="btn" onClick={()=>setAba('cadastro')}>➕ Novo</button></div>

      {aba === 'cadastro' && (
        <div className="form-grid" style={{background:'#f8f9fa', padding:'20px'}}>
           <div className="col-2">
             <div style={{height:'100px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>{form.foto_url ? <img src={form.foto_url} style={{maxWidth:'100%', maxHeight:'100%'}}/> : 'Foto'}</div>
             <input name="foto_url" placeholder="URL da Foto" value={form.foto_url} onChange={handleChange} style={{fontSize:'10px'}}/>
           </div>
           <div className="col-10">
             <div className="form-grid">
               <div className="col-6"><label>Nome Completo</label><input name="nome" value={form.nome} onChange={handleChange} /></div>
               <div className="col-3"><label>CPF / CNPJ</label><input name="cpf_cnpj" value={form.cpf_cnpj} onChange={handleChange} /></div>
               <div className="col-3"><label>RG</label><input name="rg" value={form.rg} onChange={handleChange} /></div>
               <div className="col-3"><label>WhatsApp</label><input name="whatsapp" value={form.whatsapp} onChange={handleChange} /></div>
               <div className="col-3"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleChange} /></div>
               <div className="col-6"><label>Email</label><input name="email" value={form.email} onChange={handleChange} /></div>
               <div className="col-12"><label>Endereço Completo</label><input name="endereco_completo" value={form.endereco_completo} onChange={handleChange} /></div>
             </div>
           </div>
           <div className="col-12" style={{textAlign:'right', marginTop:'15px'}}><button className="btn btn-primary" onClick={salvar}>💾 Salvar Cliente</button></div>
        </div>
      )}

      {aba === 'lista' && (
        <table>
          <thead><tr><th>Foto</th><th>Nome</th><th>Documentos</th><th>Contato</th><th>Ações</th></tr></thead>
          <tbody>
             {clientes.map(c => (
               <tr key={c.id}>
                 <td>{c.foto_url ? <img src={c.foto_url} width="30" style={{borderRadius:'50%'}}/> : '👤'}</td>
                 <td>{c.nome}</td>
                 <td>CPF: {c.cpf_cnpj} / RG: {c.rg}</td>
                 <td>{c.whatsapp}</td>
                 <td><button onClick={()=>excluir(c.id)}>🗑️</button></td>
               </tr>
             ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default TelaClientes;