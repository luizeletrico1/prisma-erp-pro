import { useState } from 'react';

function TelaEntradaXML() {
  const [itensXml, setItensXml] = useState([]);
  const [infoNota, setInfoNota] = useState(null);

  const lerXml = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const xmlText = event.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");

      // Pegar dados do Emitente (Fornecedor)
      const xNome = xmlDoc.getElementsByTagName("xNome")[0]?.textContent;
      const nNF = xmlDoc.getElementsByTagName("nNF")[0]?.textContent;
      setInfoNota({ fornecedor: xNome, numero: nNF });

      // Pegar todos os produtos (<det>)
      const produtosXml = xmlDoc.getElementsByTagName("det");
      const listaTemp = [];

      for (let i = 0; i < produtosXml.length; i++) {
        const p = produtosXml[i];
        listaTemp.push({
          codigo: p.getElementsByTagName("cProd")[0]?.textContent,
          nome: p.getElementsByTagName("xProd")[0]?.textContent,
          ncm: p.getElementsByTagName("NCM")[0]?.textContent,
          qtd: parseFloat(p.getElementsByTagName("qCom")[0]?.textContent || 0),
          vUn: parseFloat(p.getElementsByTagName("vUnCom")[0]?.textContent || 0),
          total: parseFloat(p.getElementsByTagName("vProd")[0]?.textContent || 0),
        });
      }
      setItensXml(listaTemp);
    };
    reader.readAsText(arquivo);
  };

  const confirmarEntrada = async () => {
    if (itensXml.length === 0) return;

    try {
      const res = await fetch('http://localhost:3000/api/estoque/entrada-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: itensXml, fornecedor: infoNota.fornecedor })
      });

      if (res.ok) {
        alert("✅ Estoque atualizado e novos produtos cadastrados!");
        setItensXml([]);
        setInfoNota(null);
      }
    } catch (err) {
      alert("Erro ao processar entrada.");
    }
  };

  return (
    <div className="card-box">
      <h2 className="page-title"><span className="icon-gold">📥</span> Entrada de Mercadoria (XML)</h2>
      
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #2196f3' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Selecione o arquivo XML da NF-e:</label>
        <input type="file" accept=".xml" onChange={lerXml} />
      </div>

      {infoNota && (
        <div style={{ marginBottom: '20px', padding: '10px', background: '#f8f9fa' }}>
          <strong>Fornecedor:</strong> {infoNota.fornecedor} | <strong>Nota nº:</strong> {infoNota.numero}
        </div>
      )}

      {itensXml.length > 0 && (
        <>
          <table>
            <thead>
              <tr>
                <th>Cód. Forn</th>
                <th>Produto</th>
                <th>NCM</th>
                <th>Qtd</th>
                <th>V. Unit (R$)</th>
                <th>Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {itensXml.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.codigo}</td>
                  <td>{item.nome}</td>
                  <td>{item.ncm}</td>
                  <td>{item.qtd}</td>
                  <td>{item.vUn.toFixed(2)}</td>
                  <td>{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-primary" onClick={confirmarEntrada} style={{ marginTop: '20px', width: '100%', padding: '15px' }}>
            CONFIRMAR ENTRADA NO ESTOQUE
          </button>
        </>
      )}
    </div>
  );
}

export default TelaEntradaXML;