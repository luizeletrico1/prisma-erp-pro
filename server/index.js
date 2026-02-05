const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DO MOTOR DE BANCO DE DADOS ---
const isCloud = process.env.DATABASE_URL ? true : false;
let db;

if (isCloud) {
    db = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    console.log("🐘 Motor PostgreSQL (Nuvem) Ativo!");
} else {
    db = new sqlite3.Database('./banco_dados.db');
    console.log("📦 Motor SQLite (Local) Ativo!");
}

// Função auxiliar para lidar com as diferenças de sintaxe entre SQLs
const executar = (sql, params = []) => {
    if (isCloud) {
        // Converte o padrão '?' do SQLite para o '$1, $2' do PostgreSQL
        const pgSql = sql.replace(/\?/g, (_, i) => `$${params.indexOf(params[i]) + 1}`);
        return db.query(pgSql, params);
    } else {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ lastID: this.lastID });
            });
        });
    }
};

const consultar = (sql, params = []) => {
    if (isCloud) {
        return db.query(sql, params).then(res => res.rows);
    } else {
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
};

// --- INICIALIZAÇÃO DAS TABELAS (CONFORME CADA BANCO) ---
const initDB = async () => {
    const autoInc = isCloud ? "SERIAL PRIMARY KEY" : "INTEGER PRIMARY KEY AUTOINCREMENT";
    
    const tabelas = [
        `CREATE TABLE IF NOT EXISTS usuarios (id ${autoInc}, email TEXT UNIQUE, senha TEXT, nome TEXT, cargo TEXT)`,
        `CREATE TABLE IF NOT EXISTS funcionarios (id ${autoInc}, nome TEXT, cargo TEXT, comissao_pct REAL, cpf TEXT)`,
        `CREATE TABLE IF NOT EXISTS clientes (id ${autoInc}, nome TEXT, cpf_cnpj TEXT, telefone TEXT)`,
        `CREATE TABLE IF NOT EXISTS produtos (id ${autoInc}, codigo TEXT, nome TEXT, preco_custo REAL, preco_venda REAL, estoque INTEGER, ncm TEXT, fornecedor TEXT)`,
        `CREATE TABLE IF NOT EXISTS vendas (id ${autoInc}, cliente TEXT, total REAL, data TEXT, itens TEXT, condicao_pagamento TEXT, vendedor_id INTEGER)`,
        `CREATE TABLE IF NOT EXISTS financeiro (id ${autoInc}, descricao TEXT, tipo TEXT, valor REAL, categoria TEXT, data_vencimento TEXT, status TEXT)`,
        `CREATE TABLE IF NOT EXISTS frota (id ${autoInc}, placa TEXT, modelo TEXT, km_atual INTEGER, status TEXT)`,
        `CREATE TABLE IF NOT EXISTS frota_logs (id ${autoInc}, veiculo_id INTEGER, tipo TEXT, valor REAL, km_registro INTEGER, data TEXT)`,
        `CREATE TABLE IF NOT EXISTS epis_catalogo (id ${autoInc}, nome TEXT, ca TEXT, validade_dias INTEGER, estoque INTEGER)`,
        `CREATE TABLE IF NOT EXISTS epis_entregas (id ${autoInc}, funcionario_nome TEXT, epi_nome TEXT, data_entrega TEXT, data_validade TEXT, status TEXT)`,
        `CREATE TABLE IF NOT EXISTS ficha_tecnica (id ${autoInc}, produto_pai_id INTEGER, componente_id INTEGER, quantidade REAL)`,
        `CREATE TABLE IF NOT EXISTS expedicao (id ${autoInc}, venda_id INTEGER, cliente TEXT, status TEXT, data_saida TEXT)`
    ];

    for (let sql of tabelas) {
        if (isCloud) await db.query(sql); else db.run(sql);
    }

    // Criar usuário admin padrão
    const adminSql = isCloud ? 
        "INSERT INTO usuarios (email, senha, nome, cargo) VALUES ('admin@prisma.com', '123', 'Admin', 'Gerente') ON CONFLICT (email) DO NOTHING" :
        "INSERT OR IGNORE INTO usuarios (email, senha, nome, cargo) VALUES ('admin@prisma.com', '123', 'Admin', 'Gerente')";
    if (isCloud) await db.query(adminSql); else db.run(adminSql);
};
initDB();

// --- ROTAS DO SISTEMA ---

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    const rows = await consultar(sql, [email, senha]);
    if (rows.length > 0) res.json({ usuario: rows[0] });
    else res.status(401).json({ erro: "Credenciais inválidas" });
});

app.get('/api/estatisticas', async (req, res) => {
    const vendas = await consultar("SELECT * FROM vendas");
    const faturamento = vendas.reduce((acc, v) => acc + v.total, 0);
    res.json({ 
        resumo: { faturamento, totalVendas: vendas.length, ticketMedio: faturamento/vendas.length || 0 },
        vendasMensais: [], topProdutos: [] 
    });
});

app.get('/vendas', async (req, res) => res.json(await consultar("SELECT * FROM vendas ORDER BY id DESC")));

app.post('/vendas', async (req, res) => {
    const { cliente, total, itens, condicao_pagamento, vendedor_id } = req.body;
    const data = new Date().toLocaleDateString('pt-BR');
    const result = await executar(
        "INSERT INTO vendas (cliente, total, data, itens, condicao_pagamento, vendedor_id) VALUES (?,?,?,?,?,?)",
        [cliente, total, JSON.stringify(itens), condicao_pagamento, vendedor_id]
    );
    const idVenda = isCloud ? (await consultar("SELECT last_value FROM vendas_id_seq"))[0].last_value : result.lastID;
    await executar("INSERT INTO expedicao (venda_id, cliente, status) VALUES (?,?,?)", [idVenda, cliente, 'Pendente']);
    res.json({ id: idVenda });
});

app.get('/produtos', async (req, res) => res.json(await consultar("SELECT * FROM produtos ORDER BY nome")));

app.post('/api/estoque/entrada-xml', async (req, res) => {
    const { itens, fornecedor } = req.body;
    for (let item of itens) {
        const existe = await consultar("SELECT id FROM produtos WHERE nome = ?", [item.nome]);
        if (existe.length > 0) {
            await executar("UPDATE produtos SET estoque = estoque + ?, preco_custo = ? WHERE id = ?", [item.qtd, item.vUn, existe[0].id]);
        } else {
            await executar("INSERT INTO produtos (codigo, nome, preco_custo, preco_venda, estoque, ncm, fornecedor) VALUES (?,?,?,?,?,?,?)",
            [item.codigo, item.nome, item.vUn, item.vUn * 1.5, item.qtd, item.ncm, fornecedor]);
        }
    }
    res.json({ status: "ok" });
});

app.get('/api/comissoes', async (req, res) => {
    const funcs = await consultar("SELECT * FROM funcionarios");
    const vendas = await consultar("SELECT * FROM vendas");
    const result = funcs.map(f => {
        const vDeste = vendas.filter(v => v.vendedor_id == f.id);
        const total = vDeste.reduce((a, b) => a + b.total, 0);
        return { id: f.id, nome: f.nome, cargo: f.cargo, pct: f.comissao_pct, totalVendido: total, valorComissao: total * (f.comissao_pct/100), qtdVendas: vDeste.length };
    });
    res.json(result);
});

// Rota XML (Mantida original com ajuste de conexão)
app.get('/fiscal/xml/:id', async (req, res) => {
    const rows = await consultar("SELECT * FROM vendas WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).send("Venda não encontrada");
    const venda = rows[0];
    const itens = JSON.parse(venda.itens);
    let xml = `<?xml version="1.0" encoding="UTF-8"?><nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe"><NFe><infNFe Id="NFe${venda.id}"><emit><xNome>PRISMA ERP PRO</xNome></emit><dest><xNome>${venda.cliente}</xNome></dest><det>`;
    itens.forEach((item, i) => { xml += `<prod><nItem>${i+1}</nItem><xProd>${item.nome}</xProd><qCom>${item.qtd}</qCom><vProd>${item.total}</vProd></prod>`; });
    xml += `</det><total><vNF>${venda.total}</vNF></total></infNFe></NFe></nfeProc>`;
    res.set('Content-Type', 'text/xml');
    res.send(xml);
});

// Rotas de RH, Frota, EPIs, Expedição (Simplificadas para o motor novo)
app.get('/funcionarios', async (req, res) => res.json(await consultar("SELECT * FROM funcionarios")));
app.get('/api/expedicao', async (req, res) => res.json(await consultar("SELECT * FROM expedicao")));
app.get('/api/usuarios', async (req, res) => res.json(await consultar("SELECT * FROM usuarios")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor PRISMA PRO Online na porta ${PORT}`);
});