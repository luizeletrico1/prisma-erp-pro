import { useState, useEffect } from 'react';

function TelaRelatorios() {
  const [data, setData] = useState({ vendasMensais: [], topProdutos: [], resumo: {} });

  useEffect(() => {
    fetch('http://localhost:3000/api/estatisticas')
      .then(res => res.json())
      .then(json => setData(json));
  }, []);

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">📊</span> Dashboard de Inteligência</h2>

      {/* CARDS SUPERIORES */}
      <div className="form-grid" style={{marginBottom: '30px'}}>
        <div className="col-4" style={{background:'#081f44', color:'#ffc817', padding:'20px', borderRadius:'8px', textAlign:'center'}}>
            <div style={{fontSize:'12px'}}>FATURAMENTO TOTAL</div>
            <div style={{fontSize:'28px', fontWeight:'bold'}}>R$ {data.resumo.faturamento?.toFixed(2)}</div>
        </div>
        <div className="col-4" style={{background:'#fff', border:'1px solid #ddd', padding:'20px', borderRadius:'8px', textAlign:'center'}}>
            <div style={{fontSize:'12px', color:'#777'}}>PEDIDOS REALIZADOS</div>
            <div style={{fontSize:'28px', fontWeight:'bold', color:'#081f44'}}>{data.resumo.totalVendas}</div>
        </div>
        <div className="col-4" style={{background:'#fff', border:'1px solid #ddd', padding:'20px', borderRadius:'8px', textAlign:'center'}}>
            <div style={{fontSize:'12px', color:'#777'}}>TICKET MÉDIO</div>
            <div style={{fontSize:'28px', fontWeight:'bold', color:'#28a745'}}>R$ {data.resumo.ticketMedio?.toFixed(2)}</div>
        </div>
      </div>

      <div className="form-grid">
        {/* GRÁFICO DE VENDAS MENSAIS (CSS BARS) */}
        <div className="col-7" style={{background:'#fff', padding:'20px', borderRadius:'8px', border:'1px solid #eee'}}>
            <h4 style={{marginBottom:'20px', color:'#081f44'}}>Desempenho de Vendas (Mensal)</h4>
            <div style={{display:'flex', alignItems:'flex-end', gap:'15px', height:'200px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
                {data.vendasMensais.map(item => (
                    <div key={item.mes} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                        <div style={{
                            width:'100%', 
                            background:'#ffc817', 
                            height: `${(item.valor / data.resumo.faturamento) * 150}px`,
                            borderRadius:'4px 4px 0 0',
                            transition:'height 0.5s'
                        }}></div>
                        <span style={{fontSize:'10px', marginTop:'5px', fontWeight:'bold'}}>{item.mes}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* RANKING DE PRODUTOS */}
        <div className="col-5" style={{background:'#fff', padding:'20px', borderRadius:'8px', border:'1px solid #eee'}}>
            <h4 style={{marginBottom:'20px', color:'#081f44'}}>Top 5 Produtos (Mais Vendidos)</h4>
            {data.topProdutos.map((prod, idx) => (
                <div key={prod.nome} style={{marginBottom:'12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px'}}>
                        <span><strong>{idx + 1}º</strong> {prod.nome}</span>
                        <span>{prod.qtd} un</span>
                    </div>
                    <div style={{width:'100%', background:'#f0f0f0', height:'8px', borderRadius:'4px'}}>
                        <div style={{
                            width: `${(prod.qtd / data.topProdutos[0].qtd) * 100}%`, 
                            background:'#081f44', 
                            height:'100%', 
                            borderRadius:'4px'
                        }}></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default TelaRelatorios;