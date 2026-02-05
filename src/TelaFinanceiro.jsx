import { useState, useEffect } from 'react';

function TelaFinanceiro() {
  const [lancamentos, setLancamentos] = useState([]);
  const [resumo, setResumo] = useState({ receitas: 0, despesas: 0, saldo: 0 });
  const [aba, setAba] = useState('lista'); // 'lista' ou 'novo'

  const [form, setForm] = useState({
    descricao: '', tipo: 'despesa', valor: '', categoria: 'Contas Fixas', data_vencimento: '', status: 'pendente'
  });

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const res = await fetch('http://localhost:3000/financeiro');
      const data = await res.json();
      setLancamentos(data);
      calcularResumo(data);
    } catch (err) { console.error("Erro", err); }
  };

  const calcularResumo = (dados) => {
    let rec = 0, desp = 0;
    dados.forEach(item => {
      if (item.tipo === 'receita') rec += item.valor;
      else desp += item.valor;
    });
    setResumo({ receitas: rec, despesas: desp, saldo: rec - desp });
  };

  const salvar = async () => {
    if (!form.descricao || !form.valor) return alert("Preencha descrição e valor!");
    
    await fetch('http://localhost:3000/financeiro', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(form)
    });
    
    alert("✅ Lançamento Realizado!");
    setForm({ descricao: '', tipo: 'despesa', valor: '', categoria: 'Contas Fixas', data_vencimento: '', status: 'pendente' });
    carregarDados();
    setAba('lista');
  };

  const excluir = async (id) => {
    if (confirm("Excluir este lançamento?")) {
      await fetch(`http://localhost:3000/financeiro/${id}`, { method: 'DELETE' });
      carregarDados();
    }
  };

  const alternarStatus = async (item) => {
    const novoStatus = item.status === 'pago' ? 'pendente' : 'pago';
    await fetch(`http://localhost:3000/financeiro/${item.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status: novoStatus })
    });
    carregarDados();
  };

  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">💰</span> Gestão Financeira</h2>

      {/* --- CARDS DE RESUMO --- */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'15px', marginBottom:'25px'}}>
        <div style={{background:'#d4edda', padding:'15px', borderRadius:'8px', color:'#155724', borderLeft:'5px solid #28a745'}}>
          <div style={{fontSize:'12px', fontWeight:'bold'}}>RECEITAS</div>
          <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.receitas.toFixed(2)}</div>
        </div>
        <div style={{background:'#f8d7da', padding:'15px', borderRadius:'8px', color:'#721c24', borderLeft:'5px solid #dc3545'}}>
          <div style={{fontSize:'12px', fontWeight:'bold'}}>DESPESAS</div>
          <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.despesas.toFixed(2)}</div>
        </div>
        <div style={{background: resumo.saldo >= 0 ? '#cce5ff' : '#fff3cd', padding:'15px', borderRadius:'8px', color: resumo.saldo >= 0 ? '#004085' : '#856404', borderLeft:`5px solid ${resumo.saldo >= 0 ? '#007bff' : '#ffc107'}`}}>
          <div style={{fontSize:'12px', fontWeight:'bold'}}>SALDO LÍQUIDO</div>
          <div style={{fontSize:'24px', fontWeight:'bold'}}>R$ {resumo.saldo.toFixed(2)}</div>
        </div>
      </div>

      {/* --- BOTÕES E ABAS --- */}
      <div style={{marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
        <button className="btn" style={{marginRight: '10px', background: aba==='lista'?'#081f44':'#f0f0f0', color: aba==='lista'?'#ffc817':'#333'}} onClick={()=>setAba('lista')}>📋 Extrato</button>
        <button className="btn" style={{background: aba==='novo'?'#081f44':'#f0f0f0', color: aba==='novo'?'#ffc817':'#333'}} onClick={()=>setAba('novo')}>➕ Nova Conta</button>
      </div>

      {/* --- FORMULÁRIO DE LANÇAMENTO --- */}
      {aba === 'novo' && (
        <div className="form-grid" style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', border:'1px solid #ddd'}}>
          <div className="col-12"><h4 style={{marginTop:0, color:'#081f44'}}>Lançar Receita ou Despesa</h4></div>
          
          <div className="col-8"><label>Descrição (Ex: Conta de Luz)</label><input name="descricao" value={form.descricao} onChange={handleChange} /></div>
          <div className="col-4"><label>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} style={{fontWeight:'bold', color: form.tipo==='despesa'?'red':'green'}}>
              <option value="despesa">🔴 Despesa (Saída)</option>
              <option value="receita">🟢 Receita (Entrada)</option>
            </select>
          </div>

          <div className="col-4"><label>Valor (R$)</label><input type="number" name="valor" value={form.valor} onChange={handleChange} /></div>
          <div className="col-4"><label>Categoria</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}>
              <option>Contas Fixas</option><option>Fornecedores</option><option>Salários</option><option>Vendas</option><option>Investimento</option><option>Outros</option>
            </select>
          </div>
          <div className="col-4"><label>Status</label>
             <select name="status" value={form.status} onChange={handleChange}>
              <option value="pago">✅ Pago / Recebido</option>
              <option value="pendente">⏳ Pendente</option>
            </select>
          </div>

          <div className="col-12" style={{textAlign:'right', marginTop:'15px'}}>
            <button className="btn btn-primary" onClick={salvar}>💾 Salvar Lançamento</button>
          </div>
        </div>
      )}

      {/* --- LISTA DE EXTRATO --- */}
      {aba === 'lista' && (
        <table>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lancamentos.map(item => (
              <tr key={item.id}>
                <td style={{fontWeight:'bold'}}>{item.descricao}</td>
                <td><span style={{background:'#eee', fontSize:'11px', padding:'3px 8px', borderRadius:'10px'}}>{item.categoria}</span></td>
                <td style={{color: item.tipo === 'receita' ? 'green' : 'red', fontWeight:'bold'}}>
                  {item.tipo === 'receita' ? '+' : '-'} R$ {item.valor.toFixed(2)}
                </td>
                <td>
                  <span 
                    onClick={() => alternarStatus(item)}
                    style={{cursor:'pointer', padding:'5px 10px', borderRadius:'4px', color:'white', fontSize:'11px', fontWeight:'bold', background: item.status === 'pago' ? '#28a745' : '#ffc107', textTransform:'uppercase'}}>
                    {item.status === 'pago' ? '✅ Pago' : '⏳ Pendente'}
                  </span>
                </td>
                <td>
                  <button onClick={() => excluir(item.id)} style={{border:'none', background:'transparent', cursor:'pointer'}}>🗑️</button>
                </td>
              </tr>
            ))}
            {lancamentos.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Nenhum lançamento financeiro.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TelaFinanceiro;