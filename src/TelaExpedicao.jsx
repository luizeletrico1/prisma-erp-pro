import { useState, useEffect } from 'react';

function TelaExpedicao() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => { carregar(); }, []);
  const carregar = async () => {
    const res = await fetch('http://localhost:3000/api/expedicao');
    setPedidos(await res.json());
  };

  const atualizarStatus = async (id, novoStatus) => {
    await fetch(`http://localhost:3000/api/expedicao/${id}`, {
      method: 'PUT', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ status: novoStatus })
    });
    carregar();
  };

  return (
    <div className="card-box">
      <h2 className="page-title">📦 Controle de Expedição</h2>
      <table>
        <thead><tr><th>Venda</th><th>Cliente</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>#{p.venda_id}</td>
              <td>{p.cliente}</td>
              <td><span className={`status-tag ${p.status}`}>{p.status}</span></td>
              <td>
                {p.status === 'Pendente' && <button className="btn" onClick={()=>atualizarStatus(p.id, 'Enviado')}>🚀 Despachar</button>}
                {p.status === 'Enviado' && <button className="btn" onClick={()=>atualizarStatus(p.id, 'Entregue')}>✅ Entregar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default TelaExpedicao;