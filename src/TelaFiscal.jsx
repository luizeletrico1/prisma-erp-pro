import { useState, useEffect } from 'react';

function TelaFiscal() {
  const [vendas, setVendas] = useState([]);

  useEffect(() => { carregar(); }, []);

  const carregar = async () => {
    try {
        const res = await fetch('http://localhost:3000/vendas');
        setVendas(await res.json());
    } catch (err) { console.error(err); }
  };

  const baixarXML = (id) => {
    window.open(`http://localhost:3000/fiscal/xml/${id}`, '_blank');
  };

  const imprimirCupom = (venda) => {
    const itens = JSON.parse(venda.itens);
    const janela = window.open('', '', 'width=300,height=600');
    
    janela.document.write(`
      <html>
        <head>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 280px; font-size: 12px; }
            .centralizado { text-align: center; }
            .linha { border-bottom: 1px dashed #000; margin: 5px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 3px; }
            .total { font-weight: bold; font-size: 14px; text-align: right; }
          </style>
        </head>
        <body>
          <div class="centralizado">
            <strong>PRISMA ERP PRO</strong><br>
            CNPJ: 12.345.678/0001-99<br>
            Rua do Comercio, 123 - Centro<br>
            ----------------------------<br>
            <strong>CUPOM NÃO FISCAL</strong><br>
            ----------------------------
          </div>
          <p>DOC: #${venda.id} | DATA: ${venda.data}<br>
          CLI: ${venda.cliente}</p>
          <div class="linha"></div>
          <strong>DESCRIÇÃO    QTD   UN    TOTAL</strong>
          ${itens.map(i => `
            <div class="item">
              <span>${i.nome.substring(0, 12)}</span>
              <span>${i.qtd}x</span>
              <span>${i.preco.toFixed(2)}</span>
              <span>${i.total.toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="linha"></div>
          <div class="total">TOTAL: R$ ${venda.total.toFixed(2)}</div>
          <div class="linha"></div>
          <div class="centralizado">
            OBRIGADO PELA PREFERÊNCIA!<br>
            Acesse: www.prismaerp.com.br
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
  };

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">📜</span> Gestão de Documentos</h2>
      
      <table>
        <thead>
            <tr>
                <th>Nº Venda</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Total</th>
                <th style={{textAlign:'center'}}>Ações Disponíveis</th>
            </tr>
        </thead>
        <tbody>
            {vendas.map(v => (
                <tr key={v.id}>
                    <td>#{v.id}</td>
                    <td>{v.data}</td>
                    <td><strong>{v.cliente}</strong></td>
                    <td style={{color:'green', fontWeight:'bold'}}>R$ {v.total.toFixed(2)}</td>
                    <td style={{textAlign:'center'}}>
                        <button onClick={()=>baixarXML(v.id)} className="btn" style={{background:'#0d47a1', color:'white', marginRight:'5px'}}>XML</button>
                        <button onClick={()=>imprimirCupom(v)} className="btn" style={{background:'#ffc107', color:'#000'}}>RECIBO</button>
                    </td>
                </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default TelaFiscal;