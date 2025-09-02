# Tiket Bot

Um bot de suporte para Discord que permite a criação e gerenciamento de tickets de atendimento via comandos slash.

## Funcionalidades

- Comando `/ticket` para abrir tickets de suporte com motivo obrigatório.
- Criação automática de canais privados para cada ticket.
- Botão para fechar tickets.
- Canal de logs para registrar o fechamento dos tickets e seus motivos.

## Como usar

1. **Clone o repositório e instale as dependências:**
   ```sh
   npm install
   ```

2. **Configure o token do bot:**
   - Crie um arquivo `.env` na raiz do projeto com o conteúdo:
     ```
     TOKEN=SEU_TOKEN_DO_DISCORD_AQUI
     ```

3. **Inicie o bot:**
   ```sh
   node index.js
   ```

4. **Adicione o bot ao seu servidor Discord** e use o comando `/ticket` para criar tickets.

## Requisitos

- Node.js 18 ou superior
- Permissões de administrador para o bot no servidor Discord

## Observações

- O canal de logs será criado automaticamente com o nome `logs-ticket`.
- O motivo do ticket é salvo como tópico do canal criado.

---