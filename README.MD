# MCP Modular Filiais – Servidor MCP para n8n

Este projeto implementa um servidor MCP (Model Context Protocol) compatível com o **n8n**, utilizando `express` e `SSEServerTransport`, que consulta filiais da API da **Modular Transportes** e permite filtrar por cidade ou UF.

---

## 🚀 Funcionalidades

- Integração com a API da Modular: [`/api/clicktrans/v4/filial`](https://sistemamodular.com.br/api/clicktrans/v4/filial)
- Filtro por cidade ou estado (UF)
- Suporte completo ao padrão MCP
- Compatível com a funcionalidade **“Add MCP Server”** do n8n

---

## 🧩 Requisitos

- Node.js 18+
- Chave de API (Bearer Token) da Modular
- Conta gratuita no [Render](https://render.com), Railway ou similar (opcional para deploy)

---

## 📦 Instalação

```bash
npm install
```
