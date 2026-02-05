import React, { useState } from 'react';

function TelaProdutos() {
  const [produtos, setProdutos] = useState([]);

  const [form, setForm] = useState({
    codigo: '',
    nome: '',
    preco: '',
    estoque: '',
    categoria: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const salvarProduto = (e) => {
    e.preventDefault();
    if (!form.nome || !form.preco) {
      alert("Nome e Preço são obrigatórios!");
      return;
    }

    // Adiciona o produto à lista
    setProdutos([...produtos, { ...form, id: Date.now() }]);

    // Limpa o formulário
    setForm({ codigo: '', nome: '', preco: '', estoque: '', categoria: '' });
    alert("Produto salvo!");
  };

  const excluirProduto = (id) => {
    setProdutos(produtos.filter(p => p.id !== id));
  };

  // Função auxiliar para formatar valor em Reais (R$) na visualização
  const formatarMoeda = (valor) => {
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📦 Cadastro de Produtos</h2>

      {/* --- FORMULÁRIO --- */}
      <form onSubmit={salvarProduto} style={{ background: '#f0f4f8', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label>Código (SKU):</label>
            <input 
              type="text" name="codigo" value={form.codigo} onChange={handleChange} 
              placeholder="Ex: 001" style={{ width: '100%', padding: '8px' }} 
            />
          </div>
          <div>
            <label>Nome do Produto:</label>
            <input 
              type="text" name="nome" value={form.nome} onChange={handleChange} 
              placeholder="Ex: Teclado Mecânico" required style={{ width: '100%', padding: '8px' }} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label>Preço (R$):</label>
            <input 
              type="number" name="preco" value={form.preco} onChange={handleChange} 
              placeholder="0.00" step="0.01" min="0" required 
              style={{ width: '100%', padding: '8px' }} 
            />
          </div>
          <div>
            <label>Qtd em Estoque:</label>
            <input 
              type="number" name="estoque" value={form.estoque} onChange={handleChange} 
              placeholder="0" style={{ width: '100%', padding: '8px' }} 
            />
          </div>
          <div>
            <label>Categoria:</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} style={{ width: '100%', padding: '9px' }}>
              <option value="">Selecione...</option>
              <option value="eletronicos">Eletrônicos</option>
              <option value="moveis">Móveis</option>
              <option value="limpeza">Limpeza</option>
              <option value="outros">Outros</option>
            </select>
          </div>
        </div>

        <button type="submit" style={{ marginTop: '20px', padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Adicionar Produto
        </button>
      </form>

      {/* --- LISTAGEM (TABELA) --- */}
      <h3>Estoque Atual</h3>
      {produtos.length === 0 ? <p>Nenhum produto cadastrado.</p> : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#333', color: '#fff' }}>
              <th style={{ padding: '10px' }}>Cód.</th>
              <th style={{ padding: '10px' }}>Produto</th>
              <th style={{ padding: '10px' }}>Categoria</th>
              <th style={{ padding: '10px' }}>Preço</th>
              <th style={{ padding: '10px' }}>Qtd</th>
              <th style={{ padding: '10px' }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((prod) => (
              <tr key={prod.id}>
                <td style={{ padding: '10px' }}>{prod.codigo}</td>
                <td style={{ padding: '10px' }}>{prod.nome}</td>
                <td style={{ padding: '10px', textTransform: 'capitalize' }}>{prod.categoria || '-'}</td>
                <td style={{ padding: '10px', color: 'green', fontWeight: 'bold' }}>
                  {formatarMoeda(prod.preco)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>{prod.estoque}</td>
                <td style={{ padding: '10px' }}>
                  <button onClick={() => excluirProduto(prod.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '3px' }}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TelaProdutos;