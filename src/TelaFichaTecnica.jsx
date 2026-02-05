import { useState, useEffect } from 'react';

function TelaFichaTecnica() {
  const [produtos, setProdutos] = useState([]);
  const [paiId, setPaiId] = useState('');
  const [itens, setItens] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/produtos').then(res => res.json()).then(setProdutos);
  }, []);

  const buscarFicha = async (id) => {
    setPaiId(id);
    const res = await fetch(`http://localhost:3000/api/ficha/${id}`);
    setItens(await res.json());
  };

  return (
    <div className="card-box">
      <h2 className="page-title">📜 Ficha Técnica (BOM)</h2>
      <div className="form-grid">
        <div className="col-12">
          <label>Produto Principal (Produto Acabado)</label>
          <select onChange={(e) => buscarFicha(e.target.value)}>
            <option value="">-- Selecione o Produto --</option>
            {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      {paiId && (
        <table style={{marginTop:'20px'}}>
          <thead><tr><th>Componente / Insumo</th><th>Qtd Necessária</th></tr></thead>
          <tbody>
            {itens.map(i => <tr key={i.id}><td>{i.nome}</td><td>{i.quantidade} un</td></tr>)}
            <tr><td colSpan="2" style={{textAlign:'center', color:'#999'}}>Adicionar novos componentes via API/Banco</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
export default TelaFichaTecnica;