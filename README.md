# DentalCare CRM

Esta é uma solução CRM completa para clínicas odontológicas, projetada para otimizar o gerenciamento de pacientes, agendamento de consultas e controle financeiro.

## Funcionalidades

* **Gerenciamento de Pacientes**: Mantenha registros detalhados dos seus pacientes, incluindo histórico médico, planos de tratamento e informações de contato.
* **Agendamento de Consultas**: Agende, reagende e gerencie consultas facilmente com lembretes automáticos.
* **Controle Financeiro**: Monitore faturas, pagamentos e saldos pendentes.
* **Gerenciamento de Usuários**: Administre funções e permissões de usuários dentro do sistema.

## Começando

Para configurar o projeto localmente, siga os passos abaixo:

1. **Clonar o repositório**:

   ```bash
   git clone https://github.com/AlisxB/crm-clinic.git
   cd crm-clinic
   ```

2. **Instalar dependências**:

   ```bash
   # Para o frontend
   npm install

   # Para o backend
   cd backend
   npm install
   cd ..
   ```

3. **Configurar o banco de dados**:

   Consulte o arquivo `backend/database/init.sql` para o esquema do banco de dados e dados iniciais. Você precisará de um banco de dados PostgreSQL.

4. **Configurar variáveis de ambiente**:

   Crie um arquivo `.env` no diretório `backend` com a string de conexão do banco de dados e outras configurações necessárias.

5. **Executar a aplicação**:

   ```bash
   # Iniciar o servidor backend
   cd backend
   npm start
   cd ..

   # Iniciar o servidor de desenvolvimento do frontend
   npm run dev
   ```

   O frontend normalmente será executado em `http://localhost:5173` e o backend em `http://localhost:3000` (ou conforme configurado).

## Estrutura do Projeto

* `frontend/`: Contém a aplicação frontend em React.
* `backend/`: Contém a API backend em Node.js/Express.
* `backend/src/database/init.sql`: Esquema do banco de dados e dados iniciais.

## Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para enviar pull requests ou abrir issues.

## Licença

Este projeto está licenciado sob a Licença MIT.