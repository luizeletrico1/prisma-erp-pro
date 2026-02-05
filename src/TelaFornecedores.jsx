import { useState, useEffect } from 'react';

function TelaFornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [aba, setAba] = useState('lista'); 
  const [idEdicao, setIdEdicao] = useState(null); // Controla se estamos editando

  const [form, setForm] = useState({
    razao_social: '', nome_fantasia: '', cnpj: '', categoria: 'Matéria-Prima',
    telefone: '', email: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: ''
  });

  useEffect(() => { carregarDados(); }, []);

  // --- FUNÇÕES DE API ---
  const carregarDados = async () => {
    try {
      const res = await fetch('http://localhost:3000/fornecedores');
      const data = await res.json();
      setFornecedores(data);
    } catch (error) { console.error("Erro ao buscar dados"); }
  };

  const salvar = async () => {
    if (!form.razao_social || !form.cnpj) return alert("Preencha Razão Social e CNPJ!");
    
    const url = idEdicao 
      ? `http://localhost:3000/fornecedores/${idEdicao}` // Se tem ID, atualiza
      : 'http://localhost:3000/fornecedores';            // Se não, cria novo
    
    const method = idEdicao ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      
      if (res.ok) {
        alert(idEdicao ? "✅ Atualizado com sucesso!" : "✅ Salvo com sucesso!");
        limparForm();
        carregarDados();
        setAba('lista');
      } else { alert("Erro ao salvar."); }
    } catch (error) { alert("Erro de conexão."); }
  };

  const excluir = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir ${nome}?`)) {
      try {
        await fetch(`http://localhost:3000/fornecedores/${id}`, { method: 'DELETE' });
        carregarDados(); // Recarrega a lista
      } catch (error) { alert("Erro ao excluir"); }
    }
  };

  const editar = (fornecedor) => {
    setForm(fornecedor); // Preenche o formulário com os dados da linha
    setIdEdicao(fornecedor.id); // Avisa que é uma edição
    setAba('cadastro'); // Muda para a aba de cadastro
  };

  // --- AUXILIARES ---
  const buscarCEP = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(prev => ({ ...prev, endereco: data.logradouro, bairro: data.bairro, cidade: data.localidade, estado: data.uf }));
          document.getElementById('numInput')?.focus();
        }
      } catch (error) {}
    }
  };

  const limparForm = () => {
    setForm({ razao_social: '', nome_fantasia: '', cnpj: '', categoria: 'Matéria-Prima', telefone: '', email: '', cep: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '' });
    setIdEdicao(null);
  };

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  // --- RENDERIZAÇÃO ---
  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">🚛</span> Gestão de Fornecedores</h2>

      <div style={{marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
        <div>
            <button className="btn" style={{marginRight: '10px', background: aba==='lista'?'#081f44':'#f0f0f0', color: aba==='lista'?'#ffc817':'#333'}} onClick={()=>{setAba('lista'); limparForm();}}>📋 Lista</button>
            <button className="btn" style={{background: aba==='cadastro'?'#081f44':'#f0f0f0', color: aba==='cadastro'?'#ffc817':'#333'}} onClick={()=>{setAba('cadastro'); limparForm();}}>➕ Novo</button>
        </div>
      </div>

      {aba === 'cadastro' && (
        <div className="form-grid" style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px'}}>
          <div className="col-12"><h4 style={{color:'#081f44', borderBottom:'2px solid #ffc817', paddingBottom:'5px', marginTop:0}}>{idEdicao ? '✏️ Editando Fornecedor' : '✨ Novo Cadastro'}</h4></div>
          
          <div className="col-6"><label>Razão Social *</label><input name="razao_social" value={form.razao_social} onChange={handleChange} /></div>
          <div className="col-6"><label>Nome Fantasia</label><input name="nome_fantasia" value={form.nome_fantasia} onChange={handleChange} /></div>
          <div className="col-4"><label>CNPJ *</label><input name="cnpj" value={form.cnpj} onChange={handleChange} /></div>
          <div className="col-4"><label>Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}>
              <option>Matéria-Prima</option><option>Embalagens</option><option>Transporte</option><option>Serviços</option>
            </select>
          </div>
          <div className="col-4"><label>Telefone</label><input name="telefone" value={form.telefone} onChange={handleChange} /></div>
          
          <div className="col-12"><h4 style={{color:'#081f44', borderBottom:'2px solid #ffc817', paddingBottom:'5px', marginTop:'20px'}}>Endereço</h4></div>
          <div className="col-3"><label>CEP 🔎</label><input name="cep" value={form.cep} onChange={handleChange} onBlur={buscarCEP} style={{background: '#fff3cd'}} /></div>
          <div className="col-7"><label>Logradouro</label><input name="endereco" value={form.endereco} onChange={handleChange} /></div>
          <div className="col-2"><label>Número</label><input id="numInput" name="numero" value={form.numero} onChange={handleChange} /></div>
          <div className="col-5"><label>Bairro</label><input name="bairro" value={form.bairro} onChange={handleChange} /></div>
          <div className="col-5"><label>Cidade</label><input name="cidade" value={form.cidade} onChange={handleChange} /></div>
          <div className="col-2"><label>UF</label><input name="estado" value={form.estado} onChange={handleChange} /></div>

          <div className="col-12" style={{textAlign:'right', marginTop:'20px', display:'flex', gap:'10px', justifyContent:'end'}}>
            {idEdicao && <button className="btn" style={{background:'#ccc'}} onClick={() => {setAba('lista'); limparForm();}}>Cancelar</button>}
            <button className="btn btn-primary" onClick={salvar}>{idEdicao ? '💾 Atualizar' : '💾 Salvar'}</button>
          </div>
        </div>
      )}

      {aba === 'lista' && (
        <table>
          <thead>
            <tr>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Categoria</th>
              <th>Cidade/UF</th>
              <th style={{textAlign:'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.map(f => (
              <tr key={f.id}>
                <td style={{fontWeight:'bold', color: '#081f44'}}>{f.razao_social}</td>
                <td>{f.cnpj}</td>
                <td><span style={{background:'#eee', padding:'4px 8px', borderRadius:'4px', fontSize:'11px'}}>{f.categoria}</span></td>
                <td>{f.cidade}/{f.estado}</td>
                <td style={{textAlign:'center'}}>
                  <button onClick={() => editar(f)} style={{marginRight:'10px', border:'none', background:'transparent', cursor:'pointer', fontSize:'16px'}} title="Editar">✏️</button>
                  <button onClick={() => excluir(f.id, f.razao_social)} style={{border:'none', background:'transparent', cursor:'pointer', fontSize:'16px'}} title="Excluir">🗑️</button>
                </td>
              </tr>
            ))}
            {fornecedores.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#999'}}>Nenhum fornecedor cadastrado.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TelaFornecedores;