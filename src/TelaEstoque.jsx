import { useState, useEffect } from 'react';

function TelaEstoque() {
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    carregarEstoque();
  }, []);

  const carregarEstoque = async () => {
    try {
      const res = await fetch('http://localhost:3000/produtos');
      const data = await res.json();
      setProdutos(data);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
    }
  };

  return (
    <div className="card-box">
      <h2 className="page-title">
        <span className="icon-gold">📦</span> Controle de Estoque
      </h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Visão geral dos produtos, preços e disponibilidade.
      </p>

      {/* GRID DE CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {produtos.map((p) => {
          // Tratamento para garantir que sejam números
          const preco = Number(p.preco_venda) || 0;
          const estoque = Number(p.estoque_atual) || 0;
          const estoqueBaixo = estoque < 10; // Alerta se tiver menos de 10

          return (
            <div 
              key={p.id} 
              style={{ 
                background: 'white', 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px', 
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                position: 'relative',
                borderLeft: estoqueBaixo ? '5px solid #e74c3c' : '5px solid #27ae60' // Vermelho se baixo, Verde se ok
              }}
            >
              {/* CÓDIGO DO PRODUTO */}
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '5px', textTransform: 'uppercase' }}>
                Cód: {p.codigo_interno || '-'}
              </div>

              {/* NOME DO PRODUTO */}
              <h3 style={{ margin: '0 0 15px 0', color: '#0b1a30', fontSize: '18px' }}>
                {p.descricao}
              </h3>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                
                {/* PREÇO */}
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Preço Venda</div>
                  <div style={{ color: '#0b1a30', fontWeight: 'bold', fontSize: '18px' }}>
                    R$ {preco.toFixed(2)}
                  </div>
                </div>

                {/* QUANTIDADE EM ESTOQUE */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>Em Estoque</div>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: estoqueBaixo ? '#e74c3c' : '#27ae60' 
                  }}>
                    {estoque} <span style={{ fontSize: '14px', color: '#999' }}>{p.unidade_medida || 'UN'}</span>
                  </div>
                </div>
              </div>

              {/* IMAGEM (SE TIVER) */}
              {p.imagem_url && (
                <div style={{ marginTop: '15px', textAlign: 'center' }}>
                  <img 
                    src={p.imagem_url} 
                    alt={p.descricao} 
                    style={{ maxHeight: '80px', maxWidth: '100%', borderRadius: '4px' }} 
                    onError={(e) => e.target.style.display = 'none'} // Esconde se a imagem quebrar
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TelaEstoque;