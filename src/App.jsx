import { useState } from 'react';
import './App.css';

// --- IMPORTAÇÃO DE TODOS OS MÓDULOS DO SISTEMA ---
import TelaRelatorios from './TelaRelatorios';
import TelaVendas from './TelaVendas';
import TelaOrcamentos from './TelaOrcamentos';
import TelaFiscal from './TelaFiscal';
import TelaClientes from './TelaClientes';
import TelaCadastroProdutos from './TelaCadastroProdutos';
import TelaEstoque from './TelaEstoque';
import TelaFornecedores from './TelaFornecedores';
import TelaFinanceiro from './TelaFinanceiro';
import TelaRH from './TelaRH';
import TelaProducao from './TelaProducao';
import TelaFrota from './TelaFrota';
import TelaEPIs from './TelaEPIs';
import TelaExpedicao from './TelaExpedicao';
import TelaFichaTecnica from './TelaFichaTecnica';
import TelaUsuarios from './TelaUsuarios';
import TelaLogin from './TelaLogin';
import TelaEntradaXML from './TelaEntradaXML';
import TelaComissoes from './TelaComissoes'; // <--- NOVO MÓDULO FINAL

function App() {
  // O sistema inicia na tela de Login (null = deslogado)
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [telaAtiva, setTelaAtiva] = useState('relatorios');

  // Bloqueio de Segurança: Se não houver usuário logado, mostra a Tela de Login
  if (!usuarioLogado) {
    return <TelaLogin onLoginSuccess={(dados) => setUsuarioLogado(dados)} />;
  }

  return (
    <div className="layout-container">
      {/* --- MENU LATERAL (SIDEBAR) --- */}
      <nav className="sidebar">
        <div className="brand">
          <h1>PRISMA ERP <span>PRO</span></h1>
        </div>
        
        <div style={{padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#ffc817', fontSize:'12px'}}>
           👤 {usuarioLogado.nome} ({usuarioLogado.cargo})
        </div>

        <div style={{flex: 1, overflowY: 'auto'}}>
          
          <div className="menu-category">Gestão & BI</div>
          <div className={`menu-item ${telaAtiva==='relatorios'?'active':''}`} onClick={()=>setTelaAtiva('relatorios')}>📊 Dashboard</div>
          <div className={`menu-item ${telaAtiva==='comissoes'?'active':''}`} onClick={()=>setTelaAtiva('comissoes')}>💸 Comissões</div>
          <div className={`menu-item ${telaAtiva==='fiscal'?'active':''}`} onClick={()=>setTelaAtiva('fiscal')}>📜 Notas Fiscais</div>
          <div className={`menu-item ${telaAtiva==='financeiro'?'active':''}`} onClick={()=>setTelaAtiva('financeiro')}>💰 Financeiro</div>

          <div className="menu-category">Comercial</div>
          <div className={`menu-item ${telaAtiva==='vendas'?'active':''}`} onClick={()=>setTelaAtiva('vendas')}>🛒 Vendas (PDV)</div>
          <div className={`menu-item ${telaAtiva==='orcamentos'?'active':''}`} onClick={()=>setTelaAtiva('orcamentos')}>📄 Orçamentos</div>
          <div className={`menu-item ${telaAtiva==='expedicao'?'active':''}`} onClick={()=>setTelaAtiva('expedicao')}>📦 Expedição</div>
          <div className={`menu-item ${telaAtiva==='clientes'?'active':''}`} onClick={()=>setTelaAtiva('clientes')}>👥 Clientes</div>

          <div className="menu-category">Suprimentos & Estoque</div>
          <div className={`menu-item ${telaAtiva==='xml-entrada'?'active':''}`} onClick={()=>setTelaAtiva('xml-entrada')}>📥 Entrada via XML</div>
          <div className={`menu-item ${telaAtiva==='produtos'?'active':''}`} onClick={()=>setTelaAtiva('produtos')}>🏷️ Produtos</div>
          <div className={`menu-item ${telaAtiva==='estoque'?'active':''}`} onClick={()=>setTelaAtiva('estoque')}>📦 Estoque</div>
          <div className={`menu-item ${telaAtiva==='fornecedores'?'active':''}`} onClick={()=>setTelaAtiva('fornecedores')}>🚛 Fornecedores</div>

          <div className="menu-category">Industrial</div>
          <div className={`menu-item ${telaAtiva==='ficha'?'active':''}`} onClick={()=>setTelaAtiva('ficha')}>📝 Ficha Técnica</div>
          <div className={`menu-item ${telaAtiva==='producao'?'active':''}`} onClick={()=>setTelaAtiva('producao')}>🏭 Produção</div>

          <div className="menu-category">Interno</div>
          <div className={`menu-item ${telaAtiva==='rh'?'active':''}`} onClick={()=>setTelaAtiva('rh')}>👔 RH & Pessoal</div>
          <div className={`menu-item ${telaAtiva==='epis'?'active':''}`} onClick={()=>setTelaAtiva('epis')}>🛡️ EPIs</div>
          <div className={`menu-item ${telaAtiva==='frota'?'active':''}`} onClick={()=>setTelaAtiva('frota')}>🚚 Frota</div>
          
          <div className="menu-category">Sistema</div>
          <div className={`menu-item ${telaAtiva==='usuarios'?'active':''}`} onClick={()=>setTelaAtiva('usuarios')}>⚙️ Gestão de Usuários</div>
          <div className="menu-item" onClick={()=>setUsuarioLogado(null)} style={{color: '#ff4444', marginTop: '20px'}}>🚪 Sair</div>
        </div>
      </nav>

      {/* --- ÁREA DE CONTEÚDO DINÂMICO --- */}
      <main className="content-area">
        {telaAtiva === 'relatorios' && <TelaRelatorios />}
        {telaAtiva === 'comissoes' && <TelaComissoes />}
        {telaAtiva === 'vendas' && <TelaVendas />}
        {telaAtiva === 'orcamentos' && <TelaOrcamentos />}
        {telaAtiva === 'fiscal' && <TelaFiscal />}
        {telaAtiva === 'clientes' && <TelaClientes />}
        {telaAtiva === 'produtos' && <TelaCadastroProdutos />}
        {telaAtiva === 'estoque' && <TelaEstoque />}
        {telaAtiva === 'financeiro' && <TelaFinanceiro />}
        {telaAtiva === 'fornecedores' && <TelaFornecedores />}
        {telaAtiva === 'rh' && <TelaRH />}
        {telaAtiva === 'producao' && <TelaProducao />}
        {telaAtiva === 'frota' && <TelaFrota />}
        {telaAtiva === 'epis' && <TelaEPIs />}
        {telaAtiva === 'expedicao' && <TelaExpedicao />}
        {telaAtiva === 'ficha' && <TelaFichaTecnica />}
        {telaAtiva === 'usuarios' && <TelaUsuarios />}
        {telaAtiva === 'xml-entrada' && <TelaEntradaXML />}
      </main>
    </div>
  );
}

export default App; // <--- EXPORT DEFAULT GARANTE QUE O SITE ABRA SEM TELA BRANCA!