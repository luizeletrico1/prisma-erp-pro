import { useState, useEffect } from 'react';

function TelaVendas() {
  const [produtosDB, setProdutosDB] = useState([]); 
  const [clientesDB, setClientesDB] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [historicoVendas, setHistoricoVendas] = useState([]);
  
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  const [qtd, setQtd] = useState(1);
  const [clienteSelecionado, setClienteSelecionado] = useState('Cliente Balcão');
  const [pagamento, setPagamento] = useState('Dinheiro'); // Novo Campo

  useEffect(() => { carregarDados(); }, []);

  const carregarDados = async () => {
    try {
      const resProd = await fetch('http://localhost:3000/produtos');
      if(resProd.ok) setProdutosDB(await resProd.json());

      const resVendas = await fetch('http://localhost:3000/vendas');
      if(resVendas.ok) setHistoricoVendas(await resVendas.json());

      const resCli = await fetch('http://localhost:3000/clientes');
      if(resCli.ok) setClientesDB(await resCli.json());
    } catch (err) { console.error("Erro dados"); }
  };

  const adicionarAoCarrinho = () => {
    if (!produtoSelecionadoId) return alert("Selecione um produto!");
    const produtoOriginal = produtosDB.find(p => p.id == produtoSelecionadoId);
    if (!produtoOriginal) return;

    // Verifica estoque antes de adicionar
    if (produtoOriginal.estoque < qtd) return alert(`Estoque insuficiente! Só restam ${produtoOriginal.estoque}.`);

    const novoItem = {
      id: Date.now(),
      produtoId: produtoOriginal.id,
      nome: produtoOriginal.nome,
      preco: produtoOriginal.preco_venda,
      qtd: parseInt(qtd),
      total: produtoOriginal.preco_venda * parseInt(qtd)
    };
    setCarrinho([...carrinho, novoItem]);
    setQtd(1);
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) return alert("Carrinho vazio!");

    const venda = { 
      cliente: clienteSelecionado, 
      total: carrinho.reduce((a, i) => a + i.total, 0), 
      itens: carrinho,
      condicao_pagamento: pagamento // Enviando a forma de pagamento
    };

    const res = await fetch('http://localhost:3000/vendas', {
      method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(venda)
    });
    
    const resposta = await res.json();

    if(resposta.status_financeiro === 'pendente') {
        alert("⚠️ Venda a Prazo realizada!\nLançada em 'Contas a Receber' no Financeiro.");
    } else {
        alert("💰 Venda à Vista realizada com sucesso!");
    }

    setCarrinho([]);
    carregarDados();
  };

  const removerDoCarrinho = (id) => setCarrinho(carrinho.filter(i => i.id !== id));
  const totalCarrinho = carrinho.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">🛒</span> Nova Venda (PDV)</h2>

      <div className="form-grid" style={{background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom:'20px', border:'1px solid #ddd'}}>
        
        {/* LINHA 1: CLIENTE E PAGAMENTO */}
        <div className="col-6">
            <label>Cliente</label>
            <select value={clienteSelecionado} onChange={(e) => setClienteSelecionado(e.target.value)}>
                <option value="Cliente Balcão">👤 Cliente Balcão</option>
                {clientesDB.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
            </select>
        </div>
        <div className="col-6">
            <label>Condição de Pagamento</label>
            <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} style={{background:'#eef', fontWeight:'bold', color:'#081f44'}}>
                <option value="Dinheiro">💵 Dinheiro (À Vista)</option>
                <option value="Pix">💠 Pix (À Vista)</option>
                <option value="Débito">💳 Cartão Débito (À Vista)</option>
                <option value="Crédito (30 dias)">📅 Cartão Crédito (Receber em 30d)</option>
                <option value="Boleto Bancário">📄 Boleto Bancário (A Prazo)</option>
                <option value="Prazo (Fiado)">📝 A Prazo / Fiado</option>
            </select>
        </div>

        {/* LINHA 2: PRODUTOS */}
        <div className="col-12"><hr style={{margin:'10px 0', border:0, borderTop:'1px solid #ddd'}}/></div>
        
        <div className="col-6">
            <label>Produto</label>
            <select value={produtoSelecionadoId} onChange={(e) => setProdutoSelecionadoId(e.target.value)}>
                <option value="">-- Buscar produto... --</option>
                {produtosDB.map(p => <option key={p.id} value={p.id}>{p.nome} (R$ {p.preco_venda} | Est: {p.estoque})</option>)}
            </select>
        </div>
        <div className="col-2"><label>Qtd</label><input type="number" min="1" value={qtd} onChange={(e) => setQtd(e.target.value)} /></div>
        <div className="col-4"><button className="btn btn-primary" style={{width:'100%', marginTop:'22px'}} onClick={adicionarAoCarrinho}>+ INCLUIR NO PEDIDO</button></div>
      </div>

      {/* CARRINHO */}
      {carrinho.length > 0 && (
        <div style={{marginBottom:'30px'}}>
            <table style={{background:'#fff'}}>
                <thead style={{background:'#081f44', color:'white'}}><tr><th>Produto</th><th>Qtd</th><th>Total</th><th>X</th></tr></thead>
                <tbody>
                    {carrinho.map(item => (
                        <tr key={item.id}><td>{item.nome}</td><td>{item.qtd}</td><td>R$ {item.total.toFixed(2)}</td><td><button onClick={()=>removerDoCarrinho(item.id)}>❌</button></td></tr>
                    ))}
                </tbody>
            </table>
            <div style={{marginTop:'20px', background:'#eee', padding:'20px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center', border:'1px solid #ccc'}}>
                <div style={{fontSize:'16px'}}>
                    Cliente: <strong>{clienteSelecionado}</strong><br/>
                    Pagamento: <strong>{pagamento}</strong>
                </div>
                <div style={{textAlign:'right'}}>
                    <div style={{fontSize:'12px', color:'#777'}}>TOTAL DO PEDIDO</div>
                    <div style={{fontSize:'28px', color:'#081f44', fontWeight:'bold'}}>R$ {totalCarrinho.toFixed(2)}</div>
                </div>
                <button onClick={finalizarVenda} style={{background:'#28a745', color:'white', border:'none', padding:'15px 30px', fontWeight:'bold', cursor:'pointer', borderRadius:'5px', fontSize:'14px'}}>
                    ✅ CONCLUIR VENDA
                </button>
            </div>
        </div>
      )}

      {/* HISTÓRICO RECENTE */}
      <h3 style={{marginTop:'30px', borderBottom:'1px solid #ccc', paddingBottom:'5px'}}>Últimas Vendas Realizadas</h3>
      <table>
        <thead><tr><th>ID</th><th>Data</th><th>Cliente</th><th>Pagamento</th><th>Total</th></tr></thead>
        <tbody>
            {historicoVendas.slice(0, 5).map(v => (
                <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>{v.data}</td>
                    <td>{v.cliente}</td>
                    <td><span style={{fontSize:'11px', padding:'2px 6px', borderRadius:'4px', background:'#eee'}}>{v.condicao_pagamento || 'Dinheiro'}</span></td>
                    <td style={{color:'green', fontWeight:'bold'}}>R$ {v.total.toFixed(2)}</td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default TelaVendas;