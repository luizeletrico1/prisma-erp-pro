import { useState, useEffect } from 'react';

function TelaComissoes() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/comissoes')
      .then(res => res.json())
      .then(setDados);
  }, []);

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">💸</span> Relatório de Comissões</h2>
      <p style={{color: '#666', marginBottom: '20px'}}>Valores calculados com base nas vendas faturadas no PDV.</p>

      <table>
        <thead>
          <tr style={{background: '#081f44', color: 'white'}}>
            <th>Vendedor</th>
            <th>Cargo</th>
            <th>Vendas (Qtd)</th>
            <th>Total Vendido</th>
            <th>% Comissão</th>
            <th>Valor a Pagar</th>
          </tr>
        </thead>
        <tbody>
          {dados.map(item => (
            <tr key={item.id}>
              <td><strong>{item.nome}</strong></td>
              <td>{item.cargo}</td>
              <td>{item.qtdVendas}</td>
              <td>R$ {item.totalVendido.toFixed(2)}</td>
              <td>{item.pct}%</td>
              <td style={{color: '#28a745', fontWeight: 'bold', fontSize: '16px'}}>
                R$ {item.valorComissao.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {dados.length === 0 && <div style={{textAlign:'center', padding:'20px'}}>Nenhum dado de comissão encontrado.</div>}
    </div>
  );
}

export default TelaComissoes;