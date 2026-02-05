import { useState, useEffect } from 'react';

function TelaEPIs() {
  const [catalogo, setCatalogo] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [aba, setAba] = useState('lista');

  const [formEpi, setFormEpi] = useState({ nome: '', ca: '', validade_dias: '', estoque: '' });
  const [formEntrega, setFormEntrega] = useState({ funcionario_id: '', epi_id: '' });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    const resE = await fetch('http://localhost:3000/api/epis');
    setCatalogo(await resE.json());
    const resF = await fetch('http://localhost:3000/funcionarios');
    setFuncionarios(await resF.json());
    const resEnt = await fetch('http://localhost:3000/api/epis/entregas');
    setEntregas(await resEnt.json());
  };

  const salvarEpi = async () => {
    await fetch('http://localhost:3000/api/epis', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formEpi)
    });
    alert("🛡️ Equipamento cadastrado no estoque!");
    setFormEpi({ nome: '', ca: '', validade_dias: '', estoque: '' });
    carregarDados();
  };

  const realizarEntrega = async () => {
    const funcionario = funcionarios.find(f => f.id == formEntrega.funcionario_id);
    const epi = catalogo.find(e => e.id == formEntrega.epi_id);

    if (!funcionario || !epi) return alert("Selecione o funcionário e o EPI!");
    if (epi.estoque <= 0) return alert("Estoque de EPI esgotado!");

    const payload = {
      funcionario_id: funcionario.id,
      funcionario_nome: funcionario.nome,
      epi_id: epi.id,
      epi_nome: epi.nome,
      validade_dias: epi.validade_dias
    };

    await fetch('http://localhost:3000/api/epis/entregas', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
    });

    alert(`✅ EPI entregue para ${funcionario.nome}!`);
    setFormEntrega({ funcionario_id: '', epi_id: '' });
    carregarDados();
  };

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">🛡️</span> Controle de EPIs & Segurança</h2>

      <div style={{marginBottom:'20px'}}>
        <button className="btn" onClick={()=>setAba('lista')} style={{marginRight:'10px'}}>📋 Entregas Realizadas</button>
        <button className="btn" onClick={()=>setAba('catalogo')} style={{marginRight:'10px'}}>📦 Estoque de EPIs</button>
        <button className="btn" onClick={()=>setAba('nova-entrega')} style={{background:'#081f44', color:'#ffc817'}}>👷 Lançar Entrega</button>
      </div>

      {aba === 'catalogo' && (
        <div className="form-grid" style={{background:'#f8f9fa', padding:'20px', border:'1px solid #ddd'}}>
          <div className="col-12"><h4>Cadastrar Novo Tipo de EPI</h4></div>
          <div className="col-6"><label>Nome do EPI</label><input value={formEpi.nome} onChange={e=>setFormEpi({...formEpi, nome:e.target.value})} placeholder="Ex: Capacete de Segurança" /></div>
          <div className="col-2"><label>C.A.</label><input value={formEpi.ca} onChange={e=>setFormEpi({...formEpi, ca:e.target.value})} placeholder="Num. CA" /></div>
          <div className="col-2"><label>Vida Útil (Dias)</label><input type="number" value={formEpi.validade_dias} onChange={e=>setFormEpi({...formEpi, validade_dias:e.target.value})} placeholder="180" /></div>
          <div className="col-2"><label>Qtd Estoque</label><input type="number" value={formEpi.estoque} onChange={e=>setFormEpi({...formEpi, estoque:e.target.value})} /></div>
          <div className="col-12" style={{textAlign:'right'}}><button className="btn btn-primary" onClick={salvarEpi}>💾 Salvar EPI</button></div>
        </div>
      )}

      {aba === 'nova-entrega' && (
        <div className="form-grid" style={{background:'#e3f2fd', padding:'20px', border:'1px solid #90caf9'}}>
          <div className="col-12"><h4>Registrar Entrega de Equipamento</h4></div>
          <div className="col-6"><label>Colaborador (Funcionário)</label>
            <select value={formEntrega.funcionario_id} onChange={e=>setFormEntrega({...formEntrega, funcionario_id:e.target.value})}>
                <option value="">-- Selecione o Funcionário --</option>
                {funcionarios.map(f => <option key={f.id} value={f.id}>{f.nome} ({f.cargo})</option>)}
            </select>
          </div>
          <div className="col-6"><label>Equipamento (EPI)</label>
            <select value={formEntrega.epi_id} onChange={e=>setFormEntrega({...formEntrega, epi_id:e.target.value})}>
                <option value="">-- Selecione o Equipamento --</option>
                {catalogo.map(e => <option key={e.id} value={e.id}>{e.nome} (Estoque: {e.estoque})</option>)}
            </select>
          </div>
          <div className="col-12" style={{textAlign:'right', marginTop:'10px'}}><button className="btn btn-primary" onClick={realizarEntrega}>🛡️ Confirmar Entrega</button></div>
        </div>
      )}

      {aba === 'lista' && (
        <table style={{marginTop:'20px'}}>
          <thead style={{background:'#081f44', color:'white'}}>
            <tr>
              <th>Funcionário</th>
              <th>EPI Entregue</th>
              <th>Data Entrega</th>
              <th>Próxima Troca</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map(ent => (
              <tr key={ent.id}>
                <td><strong>{ent.funcionario_nome}</strong></td>
                <td>{ent.epi_nome}</td>
                <td>{ent.data_entrega}</td>
                <td style={{color:'#d32f2f', fontWeight:'bold'}}>{ent.data_validade}</td>
                <td><span style={{background:'#d4edda', padding:'4px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'bold', color:'#1b5e20'}}>{ent.status}</span></td>
              </tr>
            ))}
            {entregas.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Nenhuma entrega registrada.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TelaEPIs;