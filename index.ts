import 'dotenv/config'; // Carrega variáveis de ambiente do arquivo .env
import express from "express"; // Framework para criar servidor HTTP
import cors from "cors"; // Middleware para permitir requisições externas (como do n8n)
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"; // Classe principal do servidor MCP
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"; // Transporte via SSE (Server-Sent Events)
import { z } from "zod"; // Biblioteca para validação de esquemas de dados

const app = express();
app.use(cors()); // Libera o acesso a partir de qualquer origem (necessário para o n8n)

// Inicializa o servidor MCP com nome e versão
const server = new McpServer({
  name: "MCP Modular Filiais",
  version: "1.0.0"
});

// Tool MCP: "listar_filiais" - faz requisição para a API da Modular e permite filtro por cidade e UF
server.tool(
  "listar_filiais",
  {
    cidade: z.string().optional(), // Parâmetro opcional de cidade
    uf: z.string().optional() // Parâmetro opcional de estado (UF)
  },
  async ({ cidade, uf }) => {
    try {
      // Requisição GET para a API da Modular
      const res = await fetch("https://sistemamodular.com.br/api/clicktrans/v4/filial", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.API_TOKEN}` // Token de autenticação via variável de ambiente
        }
      });

      const dados = await res.json(); // Converte resposta para JSON

      // Aplica filtro local (cidade e UF)
      const filtrado = dados.filter((f: any) => {
        const matchCidade = cidade ? f.Cidade.toLowerCase().includes(cidade.toLowerCase()) : true;
        const matchUF = uf ? f.UF.toLowerCase() === uf.toLowerCase() : true;
        return matchCidade && matchUF;
      });

      // Retorna os dados filtrados como texto
      return {
        content: [{
          type: "text",
          text: JSON.stringify(filtrado, null, 2)
        }]
      };
    } catch (err: any) {
      // Em caso de erro, retorna mensagem informativa
      return {
        content: [{
          type: "text",
          text: `Erro ao consultar filiais: ${err.message}`
        }]
      };
    }
  }
);

let transport: SSEServerTransport; // Variável global para manter a conexão SSE ativa

// Endpoint que inicia o canal SSE (Server-Sent Events)
app.get("/events", (req, res) => {
  transport = new SSEServerTransport("/message", res); // Inicia o transporte SSE na rota /message
});

// Endpoint que recebe mensagens MCP (requisitadas pelo n8n ou modelo)
app.post("/message", express.json(), async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res); // Encaminha a mensagem ao servidor MCP
  } else {
    res.status(503).send("SSE não conectado."); // Caso não tenha canal SSE aberto ainda
  }
});

// Inicia o servidor HTTP escutando na porta definida (3000 por padrão)
const PORT = parseInt(process.env.PORT || "3000", 10);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor MCP Modular disponível em http://localhost:${PORT}`);
});
