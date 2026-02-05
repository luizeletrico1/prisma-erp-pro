import { useState, useEffect } from 'react';

function TelaOrcamentos() {
  const [produtosDB, setProdutosDB] = useState([]); 
  const [clientesDB, setClientesDB] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [listaOrcamentos, setListaOrcamentos] = useState([]);
  
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [qtd, setQtd] = useState(1);
  const [clienteSelecionado, setClienteSelecionado] = useState('');

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const resProd = await fetch('http://localhost:3000/produtos');
      if(resProd.ok) setProdutosDB(await resProd.json());

      const resCli = await fetch('http://localhost:3000/clientes');
      if(resCli.ok) setClientesDB(await resCli.json());

      const resOrc = await fetch('http://localhost:3000/orcamentos');
      if(resOrc.ok) setListaOrcamentos(await resOrc.json());
    } catch (err) { console.error("Erro dados"); }
  };

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionadoId) return alert("Selecione um produto!");
    const produtoOriginal = produtosDB.find(p => p.id == produtoSelecionadoId);
    if (!produtoOriginal) return;

    const novoItem = {
      id: Date.now(),
      nome: produtoOriginal.nome,
      preco: produtoOriginal.preco_venda,
      qtd: parseInt(qtd),
      total: produtoOriginal.preco_venda * parseInt(qtd)
    };
    setCarrinho([...carrinho, novoItem]);
    setQtd(1);
  };

  const salvarOrcamento = async () => {
    if (carrinho.length === 0) return alert("Carrinho vazio!");
    if (!clienteSelecionado) return alert("Selecione um Cliente para o orçamento!");

    const orcamento = { 
      cliente: clienteSelecionado, 
      total: carrinho.reduce((a, i) => a + i.total, 0), 
      itens: carrinho
    };

    await fetch('http://localhost:3000/orcamentos', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(orcamento)
    });
    
    alert("📄 Orçamento Salvo com Sucesso!");
    setCarrinho([]);
    setClienteSelecionado('');
    carregarDados();
  };

  const excluirOrcamento = async (id) => {
    if(confirm("Excluir este orçamento?")) {
        await fetch(`http://localhost:3000/orcamentos/${id}`, { method: 'DELETE' });
        carregarDados();
    }
  };

  const removerDoCarrinho = (id) => setCarrinho(carrinho.filter(i => i.id !== id));
  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">📄</span> Criar Orçamento</h2>

      <div className="form-grid" style={{background: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom:'20px', border:'1px solid #ffeeba'}}>
        
        <div className="col-12"><label>Cliente</label>
            <select value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)}>
                <option value="">-- Selecione o Cliente --</option>
                {clientesDB.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
        </div>

        <div className="col-6"><label>Produto</label>
            <select value={produtoSelecionadoId} onChange={(e) => setProdutoSelecionadoId(e.target.value)}>
                <option value="">-- Buscar produto... --</option>
                {produtosDB.map(p => <option key={p.id} value={p.id}>{p.nome} (R$ {p.preco_venda})</option>)}
            </select>
        </div>
        <div className="col-2"><label>Qtd</label><input type="number" min="1" value={qtd} onChange={(e) => setQtd(e.target.value)} /></div>
        <div className="col-4"><button className="btn btn-primary" style={{width:'100%', marginTop:'22px'}} onClick={adicionarAoCarrinho}>+ ADICIONAR ITEM</button></div>
      </div>

      {carrinho.length > 0 && (
        <div style={{marginBottom:'30px'}}>
            <table style={{background:'#fff'}}>
                <thead style={{background:'#ffc107', color:'#333'}}><tr><th>Produto</th><th>Qtd</th><th>Total</th><th>X</th></tr></thead>
                <tbody>
                    {carrinho.map(item => (
                        <tr key={item.id}><td>{item.nome}</td><td>{item.qtd}</td><td>R$ {item.total.toFixed(2)}</td><td><button onClick={()=>removerDoCarrinho(item.id)}>❌</button></td></tr>
                    ))}
                </tbody>
            </table>
            <div style={{marginTop:'15px', textAlign:'right'}}>
                <div style={{fontSize:'24px', color:'#333', fontWeight:'bold', marginBottom:'10px'}}>Total Orçado: R$ {totalCarrinho.toFixed(2)}</div>
                <button onClick={salvarOrcamento} style={{background:'#081f44', color:'#ffc817', border:'none', padding:'15px 30px', fontWeight:'bold', cursor:'pointer', borderRadius:'5px'}}>
                    💾 SALVAR ORÇAMENTO
                </button>
            </div>
        </div>
      )}

      <h3 style={{marginTop:'30px', borderBottom:'1px solid #ccc', paddingBottom:'5px'}}>Orçamentos em Aberto</h3>
      <table>
        <thead><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Total</th><th>Ações</th></tr></thead>
        <tbody>
            {listaOrcamentos.map(o => (
                <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.data}</td>
                    <td>{o.cliente}</td>
                    <td style={{color:'#081f44', fontWeight:'bold'}}>R$ {o.total.toFixed(2)}</td>
                    <td>
                        <button onClick={()=>alert("Em breve: Imprimir PDF")} style={{marginRight:'10px', cursor:'pointer'}}>🖨️</button>
                        <button onClick={()=>excluirOrcamento(o.id)} style={{cursor:'pointer', color:'red'}}>🗑️</button>
                    </td>
                </tr>
            ))}
            {listaOrcamentos.length === 0 && <tr><td colSpan="5" style={{textAlign:'center', padding:'20px'}}>Nenhum orçamento pendente.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default TelaOrcamentos;