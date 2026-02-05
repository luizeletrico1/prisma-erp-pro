import { useState, useEffect } from 'react';

function TelaRH() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [aba, setAba] = useState('lista');
  const [form, setForm] = useState({
    nome: '', cargo: 'Vendedor', data_nascimento: '', cpf: '', rg: '', nit: '',
    telefone: '', whatsapp: '', email: '', endereco_completo: '',
    salario_base: '', comissao_pct: '0', foto_url: '', data_admissao: ''
  });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
        const res = await fetch('http://localhost:3000/funcionarios');
        if(res.ok) setFuncionarios(await res.json());
    } catch (err) { console.error("Erro RH", err); }
  };

  const salvar = async () => {
    if (!form.nome || !form.cpf) return alert("Nome e CPF obrigatórios");
    await fetch('http://localhost:3000/funcionarios', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form)
    });
    alert("✅ Salvo com sucesso!");
    setForm({ nome: '', cargo: 'Vendedor', data_nascimento: '', cpf: '', rg: '', nit: '', telefone: '', whatsapp: '', email: '', endereco_completo: '', salario_base: '', comissao_pct: '0', foto_url: '', data_admissao: '' });
    setAba('lista');
    carregar();
  };

  const excluir = async (id) => {
    if (confirm("Excluir?")) {
      await fetch(`http://localhost:3000/funcionarios/${id}`, { method: 'DELETE' });
      carregar();
    }
  };

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">👔</span> Gestão de RH</h2>
      
      <div style={{marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
        <button className="btn" style={{marginRight:'10px', background: aba==='lista'?'#081f44':'#f0f0f0', color: aba==='lista'?'#ffc817':'#333'}} onClick={()=>setAba('lista')}>📋 Lista</button>
        <button className="btn" style={{background: aba==='cadastro'?'#081f44':'#f0f0f0', color: aba==='cadastro'?'#ffc817':'#333'}} onClick={()=>setAba('cadastro')}>➕ Novo Colaborador</button>
      </div>

      {aba === 'cadastro' && (
        <div className="form-grid" style={{background: '#f8f9fa', padding: '25px', borderRadius: '8px', border:'1px solid #e0e0e0'}}>
          
          {/* FOTO E NOME - Layout Fluido */}
          <div className="col-12" style={{marginBottom:'10px'}}>
             <h4 style={{borderBottom:'2px solid #ffc817', display:'inline-block', marginBottom:'15px'}}>Identificação</h4>
          </div>

          {/* FOTO (Centralizada em cima ou pequena URL) */}
          <div className="col-12">
            <label>Link da Foto (URL)</label>
            <div style={{display:'flex', gap:'10px'}}>
                <input name="foto_url" value={form.foto_url} onChange={handleChange} placeholder="http://..." />
                <div style={{width:'50px', height:'40px', background:'#ddd', borderRadius:'4px', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    {form.foto_url ? <img src={form.foto_url} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : '📷'}
                </div>
            </div>
          </div>

          {/* NOME AGORA É COL-12 (LINHA INTEIRA) */}
          <div className="col-12">
            <label>Nome Completo *</label>
            <input name="nome" value={form.nome} onChange={handleChange} style={{fontWeight:'bold', fontSize:'16px'}} />
          </div>

          {/* DADOS BÁSICOS */}
          <div className="col-4">
             <label>Cargo</label>
             <select name="cargo" value={form.cargo} onChange={handleChange}>
                <option>Vendedor</option><option>Gerente</option><option>Estoquista</option><option>Financeiro</option>
             </select>
          </div>
          <div className="col-4"><label>Data Nascimento</label><input type="date" name="data_nascimento" value={form.data_nascimento} onChange={handleChange} /></div>
          <div className="col-4"><label>Data Admissão</label><input type="date" name="data_admissao" value={form.data_admissao} onChange={handleChange} /></div>

          {/* DOCUMENTOS */}
          <div className="col-12" style={{marginTop:'15px'}}><h4 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px'}}>Documentos</h4></div>
          <div className="col-4"><label>CPF *</label><input name="cpf" value={form.cpf} onChange={handleChange} /></div>
          <div className="col-4"><label>RG</label><input name="rg" value={form.rg} onChange={handleChange} /></div>
          <div className="col-4"><label>NIT / PIS</label><input name="nit" value={form.nit} onChange={handleChange} /></div>

          {/* CONTATO */}
          <div className="col-12" style={{marginTop:'15px'}}><h4 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px'}}>Contato & Endereço</h4></div>
          <div className="col-6"><label>Email</label><input name="email" value={form.email} onChange={handleChange} /></div>
          <div className="col-3"><label>WhatsApp</label><input name="whatsapp" value={form.whatsapp} onChange={handleChange} /></div>
          <div className="col-3"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleChange} /></div>
          
          {/* ENDEREÇO LINHA INTEIRA */}
          <div className="col-12">
             <label>Endereço Completo</label>
             <input name="endereco_completo" value={form.endereco_completo} onChange={handleChange} placeholder="Rua, Número, Bairro, Cidade..." />
          </div>

          {/* FINANCEIRO */}
          <div className="col-12" style={{marginTop:'15px'}}><h4 style={{borderBottom:'1px solid #ccc', paddingBottom:'5px'}}>Dados Financeiros</h4></div>
          <div className="col-6"><label>Salário Base (R$)</label><input type="number" name="salario_base" value={form.salario_base} onChange={handleChange} /></div>
          <div className="col-6"><label>Comissão (%)</label><input type="number" name="comissao_pct" value={form.comissao_pct} onChange={handleChange} /></div>

          <div className="col-12" style={{marginTop:'20px', textAlign:'right'}}>
             <button className="btn btn-primary" onClick={salvar} style={{width:'100%', padding:'15px'}}>💾 SALVAR FICHA</button>
          </div>

        </div>
      )}

      {aba === 'lista' && (
        <table style={{marginTop:'20px'}}>
          <thead><tr><th>Foto</th><th>Nome</th><th>Cargo</th><th>CPF</th><th>Ações</th></tr></thead>
          <tbody>
            {funcionarios.map(f => (
              <tr key={f.id}>
                <td>{f.foto_url ? <img src={f.foto_url} width="30" height="30" style={{borderRadius:'50%'}}/> : '👤'}</td>
                <td style={{fontWeight:'bold'}}>{f.nome}</td>
                <td>{f.cargo}</td>
                <td>{f.cpf}</td>
                <td><button onClick={()=>excluir(f.id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TelaRH;