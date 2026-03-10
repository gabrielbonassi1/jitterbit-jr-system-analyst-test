# Jitterbit - Jr System Analyst Test

API REST para gerenciamento de pedidos (Orders) com Node.js, Express e PostgreSQL.

### Estrutura do banco de dados

O banco de dados possui duas tabelas principais:

#### Tabela `Order`
- `orderId` (VARCHAR) - ID único do pedido
- `value` (DECIMAL) - Valor total do pedido
- `creationDate` (TIMESTAMP) - Data de criação
- `updatedAt` (TIMESTAMP) - Data de atualização

#### Tabela `Items`
- `id` (SERIAL) - ID único do item
- `orderId` (VARCHAR) - Referência ao pedido
- `productId` (VARCHAR) - ID do produto
- `quantity` (INTEGER) - Quantidade
- `price` (DECIMAL) - Preço unitário

### Iniciar o Banco de Dados

```bash
# Iniciar o PostgreSQL via Docker Compose
docker-compose up -d

# Parar o banco de dados
docker-compose down
```

Senha padrão: `admin123`

### Configuração

1. Copie o arquivo de exemplo das variáveis de ambiente:
```bash
cp .env.example .env
```

2. Ajuste as variáveis conforme necessário no arquivo `.env`

### Endpoints da API

#### Obrigatórios
- `POST /order` - Criar novo pedido
- `GET /order/:orderId` - Buscar pedido por ID

#### Opcionais
- `GET /order/list` - Listar todos os pedidos
- `PUT /order/:orderId` - Atualizar pedido
- `DELETE /order/:orderId` - Deletar pedido

### Autenticação

Todas as rotas são protegidas por JWT. Inclua o token no header:
```
Authorization: Bearer <seu_token_jwt>
```
