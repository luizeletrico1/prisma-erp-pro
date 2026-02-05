import { useState, useEffect } from 'react';

function TelaFrota() {
  const [veiculos, setVeiculos] = useState([]);
  const [logs, setLogs] = useState([]);
  const [aba, setAba] = useState('lista');
  const [formV, setFormV] = useState({ placa:'', modelo:'', marca:'', ano:'', km_atual:'' });
  const [formL, setFormL] = useState({ veiculo_id:'', tipo:'Combustível', valor:'', km_registro:'' });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    const resV = await fetch('http://localhost:3000/api/frota');
    setVeiculos(await resV.json());
    const resL = await fetch('http://localhost:3000/api/frota/logs');
    setLogs(await resL.json());
  };

  const salvarVeiculo = async () => {
    await fetch('http://localhost:3000/api/frota', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formV)
    });
    alert("🚚 Veículo Cadastrado!");
    setAba('lista'); carregarDados();
  };

  const salvarLog = async () => {
    await fetch('http://localhost:3000/api/frota/logs', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(formL)
    });
    alert("⛽ Registro de Gasto Salvo!");
    setFormL({ veiculo_id:'', tipo:'Combustível', valor:'', km_registro:'' });
    carregarDados();
  };

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">🚚</span> Gestão de Frota & Logística</h2>

      <div style={{marginBottom:'20px'}}>
        <button className="btn" onClick={()=>setAba('lista')} style={{marginRight:'10px'}}>📋 Frota</button>
        <button className="btn" onClick={()=>setAba('cadastro')} style={{marginRight:'10px'}}>➕ Novo Veículo</button>
        <button className="btn" onClick={()=>setAba('gastos')} style={{background:'#081f44', color:'#ffc817'}}>⛽ Lançar Gasto</button>
      </div>

      {aba === 'cadastro' && (
        <div className="form-grid" style={{background:'#f8f9fa', padding:'20px'}}>
          <div className="col-3"><label>Placa</label><input value={formV.placa} onChange={e=>setFormV({...formV, placa:e.target.value})} /></div>
          <div className="col-3"><label>Marca</label><input value={formV.marca} onChange={e=>setFormV({...formV, marca:e.target.value})} /></div>
          <div className="col-3"><label>Modelo</label><input value={formV.modelo} onChange={e=>setFormV({...formV, modelo:e.target.value})} /></div>
          <div className="col-3"><label>Ano</label><input value={formV.ano} onChange={e=>setFormV({...formV, ano:e.target.value})} /></div>
          <div className="col-4"><label>KM Inicial</label><input type="number" value={formV.km_atual} onChange={e=>setFormV({...formV, km_atual:e.target.value})} /></div>
          <div className="col-12"><button className="btn btn-primary" onClick={salvarVeiculo}>💾 Salvar Veículo</button></div>
        </div>
      )}

      {aba === 'gastos' && (
        <div className="form-grid" style={{background:'#fff3cd', padding:'20px', border:'1px solid #ffeeba'}}>
          <div className="col-4"><label>Veículo</label>
            <select value={formL.veiculo_id} onChange={e=>setFormL({...formL, veiculo_id:e.target.value})}>
                <option value="">-- Selecione --</option>
                {veiculos.map(v => <option key={v.id} value={v.id}>{v.modelo} ({v.placa})</option>)}
            </select>
          </div>
          <div className="col-3"><label>Tipo de Gasto</label>
            <select value={formL.tipo} onChange={e=>setFormL({...formL, tipo:e.target.value})}>
                <option>Combustível</option><option>Óleo</option><option>Mecânica</option><option>Pneu</option>
            </select>
          </div>
          <div className="col-2"><label>Valor (R$)</label><input type="number" value={formL.valor} onChange={e=>setFormL({...formL, valor:e.target.value})} /></div>
          <div className="col-3"><label>KM Atual</label><input type="number" value={formL.km_registro} onChange={e=>setFormL({...formL, km_registro:e.target.value})} /></div>
          <div className="col-12"><button className="btn btn-primary" onClick={salvarLog}>⛽ Registrar Gasto</button></div>
        </div>
      )}

      {aba === 'lista' && (
        <>
          <div className="form-grid" style={{marginBottom:'30px'}}>
            {veiculos.map(v => (
                <div key={v.id} className="col-4" style={{background:'#fff', border:'1px solid #ddd', padding:'15px', borderRadius:'8px'}}>
                    <div style={{fontSize:'18px', fontWeight:'bold', color:'#081f44'}}>{v.modelo}</div>
                    <div style={{fontSize:'12px', color:'#777'}}>Placa: {v.placa} | Ano: {v.ano}</div>
                    <div style={{marginTop:'10px', fontSize:'14px'}}>📟 KM: <strong>{v.km_atual}</strong></div>
                    <div style={{color: v.status === 'Ativo' ? 'green' : 'red', fontWeight:'bold', fontSize:'11px'}}>{v.status}</div>
                </div>
            ))}
          </div>
          <h3>Histórico de Gastos Recentes</h3>
          <table>
            <thead><tr><th>Data</th><th>Veículo</th><th>Tipo</th><th>KM</th><th>Valor</th></tr></thead>
            <tbody>
                {logs.map(l => (
                    <tr key={l.id}>
                        <td>{l.data}</td>
                        <td>{l.modelo} ({l.placa})</td>
                        <td>{l.tipo}</td>
                        <td>{l.km_registro} km</td>
                        <td style={{color:'red', fontWeight:'bold'}}>R$ {l.valor.toFixed(2)}</td>
                    </tr>
                ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
export default TelaFrota;