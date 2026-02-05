import { useState, useEffect } from 'react';

function TelaCadastroProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [aba, setAba] = useState('lista');
  const [form, setForm] = useState({ 
      codigo: '', nome: '', descricao: '', preco_custo: '', preco_venda: '', estoque: '', 
      imagem_url: '', fornecedor: '', ncm: '', cfop: '5102' 
  });

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    const res = await fetch('http://localhost:3000/produtos');
    setProdutos(await res.json());
    const resForn = await fetch('http://localhost:3000/fornecedores');
    setFornecedores(await resForn.json());
  };

  const salvar = async () => {
    await fetch('http://localhost:3000/produtos', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    alert("✅ Produto Salvo!");
    setForm({ codigo: '', nome: '', descricao: '', preco_custo: '', preco_venda: '', estoque: '', imagem_url: '', fornecedor: '', ncm: '', cfop: '5102' });
    setAba('lista');
    carregar();
  };
  const excluir = async (id) => { if(confirm("Apagar?")) { await fetch(`http://localhost:3000/produtos/${id}`, {method:'DELETE'}); carregar(); }};
  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">🏷️</span> Cadastro de Produtos (Fiscal)</h2>
      <div style={{marginBottom:'20px'}}><button className="btn" onClick={()=>setAba('lista')}>📋 Lista</button> <button className="btn" onClick={()=>setAba('cadastro')}>➕ Novo</button></div>

      {aba === 'cadastro' && (
        <div className="form-grid" style={{background:'#f8f9fa', padding:'20px'}}>
           <div className="col-12"><h4 style={{borderBottom:'1px solid #ddd'}}>Dados do Produto</h4></div>
           <div className="col-3"><label>Código (SKU)</label><input name="codigo" value={form.codigo} onChange={handleChange} /></div>
           <div className="col-9"><label>Nome do Produto</label><input name="nome" value={form.nome} onChange={handleChange} /></div>
           <div className="col-3"><label>Preço Custo</label><input type="number" name="preco_custo" value={form.preco_custo} onChange={handleChange} /></div>
           <div className="col-3"><label>Preço Venda</label><input type="number" name="preco_venda" value={form.preco_venda} onChange={handleChange} /></div>
           <div className="col-3"><label>Estoque</label><input type="number" name="estoque" value={form.estoque} onChange={handleChange} /></div>
           <div className="col-3"><label>Fornecedor</label>
             <select name="fornecedor" value={form.fornecedor} onChange={handleChange}>
               <option value="">-- Selecione --</option>
               {fornecedores.map(f => <option key={f.id} value={f.razao_social}>{f.razao_social}</option>)}
             </select>
           </div>
           
           <div className="col-12"><h4 style={{borderBottom:'1px solid #ddd', marginTop:'15px'}}>Fiscal (Obrigatório para NFe)</h4></div>
           <div className="col-6"><label>NCM (Classificação Fiscal)</label><input name="ncm" value={form.ncm} onChange={handleChange} placeholder="Ex: 8504.40.21" /></div>
           <div className="col-6"><label>CFOP</label><input name="cfop" value={form.cfop} onChange={handleChange} placeholder="Ex: 5102" /></div>
           
           <div className="col-12"><label>Descrição Detalhada</label><input name="descricao" value={form.descricao} onChange={handleChange} /></div>
           <div className="col-12" style={{textAlign:'right', marginTop:'15px'}}><button className="btn btn-primary" onClick={salvar}>💾 Salvar Produto</button></div>
        </div>
      )}

      {aba === 'lista' && (
        <table>
          <thead><tr><th>Cód</th><th>Produto</th><th>NCM</th><th>Estoque</th><th>Ações</th></tr></thead>
          <tbody>
             {produtos.map(p => (
               <tr key={p.id}>
                 <td>{p.codigo}</td>
                 <td>{p.nome}</td>
                 <td>{p.ncm || <span style={{color:'red'}}>Sem NCM</span>}</td>
                 <td>{p.estoque}</td>
                 <td><button onClick={()=>excluir(p.id)}>🗑️</button></td>
               </tr>
             ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default TelaCadastroProdutos;