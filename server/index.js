const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./banco_dados.db', (err) => {
  if (err) console.error("Erro banco:", err.message);
  else console.log("📦 Banco V8.0 (Completo) conectado!");
});

db.serialize(() => {
  // --- SEGURANÇA E ACESSO ---
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT, senha TEXT, nome TEXT, cargo TEXT)`);
  db.run(`INSERT OR IGNORE INTO usuarios (email, senha, nome, cargo) VALUES ('admin@prisma.com', '123', 'Admin', 'Gerente Geral')`);

  // --- INDUSTRIAL E ENGENHARIA (FICHA TÉCNICA) ---
  db.run(`CREATE TABLE IF NOT EXISTS ficha_tecnica (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_pai_id INTEGER,
    componente_id INTEGER,
    quantidade REAL
  )`);

  // --- LOGÍSTICA DE SAÍDA (EXPEDIÇÃO) ---
  db.run(`CREATE TABLE IF NOT EXISTS expedicao (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER,
    cliente TEXT,
    status TEXT, -- 'Pendente', 'Em Separação', 'Enviado', 'Entregue'
    data_saida TEXT
  )`);

  // --- TABELAS ANTERIORES (MANTIDAS) ---
  db.run(`CREATE TABLE IF NOT EXISTS funcionarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, cargo TEXT, cpf TEXT, foto_url TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS clientes (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, cpf_cnpj TEXT, telefone TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, codigo TEXT, nome TEXT, preco_venda REAL, estoque INTEGER, ncm TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS vendas (id INTEGER PRIMARY KEY AUTOINCREMENT, cliente TEXT, total REAL, data TEXT, itens TEXT, condicao_pagamento TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS financeiro (id INTEGER PRIMARY KEY AUTOINCREMENT, descricao TEXT, tipo TEXT, valor REAL, categoria TEXT, data_vencimento TEXT, status TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS frota (id INTEGER PRIMARY KEY AUTOINCREMENT, placa TEXT, modelo TEXT, km_atual INTEGER, status TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS epis_entregas (id INTEGER PRIMARY KEY AUTOINCREMENT, funcionario_nome TEXT, epi_nome TEXT, data_validade TEXT)`);
});

// --- ROTAS DE USUÁRIOS E LOGIN ---
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  db.get("SELECT * FROM usuarios WHERE email = ? AND senha = ?", [email, senha], (err, row) => {
    if (row) res.json({ usuario: row });
    else res.status(401).json({ erro: "Acesso Negado" });
  });
});

app.get('/api/usuarios', (req, res) => { db.all("SELECT * FROM usuarios", [], (err, rows) => res.json(rows)); });
app.post('/api/usuarios', (req, res) => {
  const { nome, email, senha, cargo } = req.body;
  db.run("INSERT INTO usuarios (nome, email, senha, cargo) VALUES (?,?,?,?)", [nome, email, senha, cargo], function() { res.json({id: this.lastID}); });
});

// --- ROTAS DE EXPEDIÇÃO ---
app.get('/api/expedicao', (req, res) => { db.all("SELECT * FROM expedicao ORDER BY id DESC", [], (err, rows) => res.json(rows)); });
app.put('/api/expedicao/:id', (req, res) => {
  const { status } = req.body;
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  db.run("UPDATE expedicao SET status = ?, data_saida = ? WHERE id = ?", [status, dataHoje, req.params.id], () => res.json({msg: "Ok"}));
});

// --- ROTA DE VENDA (INTEGRADA COM EXPEDIÇÃO) ---
app.post('/vendas', (req, res) => {
  const { cliente, total, itens, condicao_pagamento } = req.body;
  const dataHoje = new Date().toLocaleDateString('pt-BR');
  db.run(`INSERT INTO vendas (cliente, total, data, itens, condicao_pagamento) VALUES (?, ?, ?, ?, ?)`, 
    [cliente, total, dataHoje, JSON.stringify(itens), condicao_pagamento], function(err) {
      const idVenda = this.lastID;
      // Cria automaticamente a ordem de expedição
      db.run("INSERT INTO expedicao (venda_id, cliente, status) VALUES (?,?,?)", [idVenda, cliente, 'Pendente']);
      res.json({ id: idVenda });
  });
});

// --- ROTAS DE FICHA TÉCNICA ---
app.get('/api/ficha/:id', (req, res) => {
  db.all("SELECT f.*, p.nome FROM ficha_tecnica f JOIN produtos p ON f.componente_id = p.id WHERE f.produto_pai_id = ?", [req.params.id], (err, rows) => res.json(rows));
});
app.post('/api/ficha', (req, res) => {
  const { produto_pai_id, componente_id, quantidade } = req.body;
  db.run("INSERT INTO ficha_tecnica (produto_pai_id, componente_id, quantidade) VALUES (?,?,?)", [produto_pai_id, componente_id, quantidade], () => res.json({msg:"Ok"}));
});

// Mantém rotas antigas simplificadas para funcionamento
app.get('/produtos', (req, res) => { db.all("SELECT * FROM produtos", [], (err, r) => res.json(r)); });
app.get('/clientes', (req, res) => { db.all("SELECT * FROM clientes", [], (err, r) => res.json(r)); });
app.get('/funcionarios', (req, res) => { db.all("SELECT * FROM funcionarios", [], (err, r) => res.json(r)); });

// ROTA PARA PROCESSAR ENTRADA DE XML
app.post('/api/estoque/entrada-xml', (req, res) => {
  const { itens, fornecedor } = req.body;
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  // Para cada item do XML
  itens.forEach(item => {
    // Tenta encontrar o produto pelo nome
    db.get("SELECT id FROM produtos WHERE nome = ?", [item.nome], (err, row) => {
      if (row) {
        // Se existe, apenas aumenta o estoque
        db.run("UPDATE produtos SET estoque = estoque + ?, preco_custo = ? WHERE id = ?", [item.qtd, item.vUn, row.id]);
      } else {
        // Se não existe, cadastra o produto novo automaticamente
        db.run(`INSERT INTO produtos (codigo, nome, preco_custo, preco_venda, estoque, ncm, fornecedor) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`, 
                [item.codigo, item.nome, item.vUn, item.vUn * 1.5, item.qtd, item.ncm, fornecedor]);
      }
    });
  });

  // Registra a entrada no financeiro como uma despesa futura (opcional)
  const totalNota = itens.reduce((acc, i) => acc + i.total, 0);
  db.run(`INSERT INTO financeiro (descricao, tipo, valor, categoria, data_vencimento, status) 
          VALUES (?, 'despesa', ?, 'Compras', ?, 'pendente')`, 
          [`Compra XML - ${fornecedor}`, totalNota, dataHoje]);

  res.json({ msg: "Processado com sucesso" });
});
// ROTA DE COMISSÕES (BI DE RH)
app.get('/api/comissoes', (req, res) => {
  // Busca todos os funcionários para ter as porcentagens
  db.all("SELECT id, nome, cargo, comissao_pct FROM funcionarios", [], (err, funcs) => {
    if (err) return res.status(500).json(err);

    // Busca todas as vendas
    db.all("SELECT total, cliente, data, vendedor_id FROM vendas", [], (err, vendas) => {
      if (err) return res.status(500).json(err);

      // Mapeia o resultado agrupando por funcionário
      const relatorio = funcs.map(f => {
        // Filtra vendas deste funcionário (usando nome ou ID)
        const vendasDeste = vendas.filter(v => v.vendedor_id == f.id || v.cliente.includes(f.nome)); 
        const totalVendido = vendasDeste.reduce((acc, v) => acc + v.total, 0);
        const valorComissao = totalVendido * (f.comissao_pct / 100);

        return {
          id: f.id,
          nome: f.nome,
          cargo: f.cargo,
          pct: f.comissao_pct,
          totalVendido: totalVendido,
          valorComissao: valorComissao,
          qtdVendas: vendasDeste.length
        };
      });

      res.json(relatorio);
    });
  });
});
app.listen(3000, () => { console.log('🚀 Servidor V8.0 (Completo) rodando!'); });