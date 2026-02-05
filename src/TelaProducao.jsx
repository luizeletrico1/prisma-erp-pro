import { useState, useEffect } from 'react';

function TelaProducao() {
  const [produtos, setProdutos] = useState([]);
  const [historico, setHistorico] = useState([]);
  
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [qtd, setQtd] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const resProd = await fetch('http://localhost:3000/produtos');
      setProdutos(await resProd.json());

      const resHist = await fetch('http://localhost:3000/producao');
      setHistorico(await resHist.json());
    } catch (err) { console.error("Erro ao carregar"); }
  };

  const registrarProducao = async () => {
    if (!produtoSelecionado || !qtd) return alert("Selecione o produto e a quantidade!");
    
    // Pega o nome do produto
    const prodObj = produtos.find(p => p.id == produtoSelecionado);
    if (!prodObj) return;

    const payload = {
      produto_id: prodObj.id,
      produto_nome: prodObj.nome,
      qtd_produzida: parseInt(qtd)
    };

    await fetch('http://localhost:3000/producao', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });

    alert(`🏭 Produção de ${qtd}x ${prodObj.nome} registrada!\nEstoque atualizado.`);
    setQtd('');
    setProdutoSelecionado('');
    carregarDados();
  };

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">🏭</span> Ordem de Produção (Chão de Fábrica)</h2>

      {/* PAINEL DE CONTROLE DA PRODUÇÃO */}
      <div className="form-grid" style={{background: '#e3f2fd', padding: '25px', borderRadius: '8px', border:'1px solid #90caf9', marginBottom:'30px'}}>
        <div className="col-12"><h3 style={{marginTop:0, color:'#0d47a1'}}>Nova Ordem de Produção</h3></div>

        <div className="col-6">
          <label style={{color:'#0d47a1'}}>Produto a Fabricar</label>
          <select value={produtoSelecionado} onChange={(e) => setProdutoSelecionado(e.target.value)} 
                  style={{fontSize:'16px', padding:'12px', border:'2px solid #0d47a1'}}>
             <option value="">-- Selecione o Produto --</option>
             {produtos.map(p => (
               <option key={p.id} value={p.id}>{p.nome} (Estoque Atual: {p.estoque})</option>
             ))}
          </select>
        </div>

        <div className="col-3">
          <label style={{color:'#0d47a1'}}>Quantidade</label>
          <input type="number" value={qtd} onChange={(e) => setQtd(e.target.value)} 
                 style={{fontSize:'16px', padding:'12px', border:'2px solid #0d47a1'}} placeholder="0" />
        </div>

        <div className="col-3" style={{display:'flex', alignItems:'end'}}>
          <button className="btn" onClick={registrarProducao} 
                  style={{width:'100%', padding:'14px', background:'#0d47a1', color:'white', fontSize:'14px', fontWeight:'bold'}}>
             🚀 INICIAR PRODUÇÃO
          </button>
        </div>
      </div>

      {/* HISTÓRICO DE PRODUÇÃO */}
      <h3 style={{color:'#081f44', borderBottom:'1px solid #ccc', paddingBottom:'10px'}}>Histórico de Fabricação</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Produto</th>
            <th>Qtd Produzida</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {historico.map(h => (
            <tr key={h.id}>
              <td>#{h.id}</td>
              <td>{h.data_producao}</td>
              <td style={{fontWeight:'bold'}}>{h.produto_nome}</td>
              <td style={{color:'blue', fontWeight:'bold'}}>+ {h.qtd_produzida} un</td>
              <td><span style={{background:'#d4edda', color:'#155724', padding:'4px 8px', borderRadius:'10px', fontSize:'11px', fontWeight:'bold'}}>✅ CONCLUÍDO</span></td>
            </tr>
          ))}
          {historico.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Nenhuma produção registrada.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default TelaProducao;