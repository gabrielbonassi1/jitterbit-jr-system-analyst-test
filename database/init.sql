CREATE TABLE IF NOT EXISTS "Order" (
    "orderId" VARCHAR(50) PRIMARY KEY,
    "value" DECIMAL(10, 2) NOT NULL,
    "creationDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Items" (
    "id" SERIAL PRIMARY KEY,
    "orderId" VARCHAR(50) NOT NULL,
    "productId" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "price" DECIMAL(10, 2) NOT NULL CHECK ("price" >= 0),
    CONSTRAINT fk_order
        FOREIGN KEY("orderId") 
        REFERENCES "Order"("orderId")
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_items_order_id ON "Items"("orderId");
CREATE INDEX IF NOT EXISTS idx_order_creation_date ON "Order"("creationDate");

COMMENT ON TABLE "Order" IS 'Tabela de pedidos do sistema';
COMMENT ON TABLE "Items" IS 'Tabela de itens de cada pedido';

COMMENT ON COLUMN "Order"."orderId" IS 'Identificador único do pedido';
COMMENT ON COLUMN "Order"."value" IS 'Valor total do pedido';
COMMENT ON COLUMN "Order"."creationDate" IS 'Data e hora de criação do pedido';
COMMENT ON COLUMN "Items"."orderId" IS 'Referência ao pedido (FK)';
COMMENT ON COLUMN "Items"."productId" IS 'Identificador do produto';
COMMENT ON COLUMN "Items"."quantity" IS 'Quantidade do produto no pedido';
COMMENT ON COLUMN "Items"."price" IS 'Preço unitário do produto';
