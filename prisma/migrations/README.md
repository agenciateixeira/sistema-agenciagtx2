# Como Executar as Migrations no Supabase

## Passo a Passo

1. **Acesse o Supabase Dashboard**
   - Vá para https://app.supabase.com
   - Faça login com sua conta
   - Selecione o projeto: `bortomadefyundsarhpu`

2. **Abra o SQL Editor**
   - No menu lateral esquerdo, clique em "SQL Editor"
   - Clique em "New Query" para criar uma nova consulta

3. **Execute o Script SQL**
   - Copie todo o conteúdo do arquivo `create_tables.sql`
   - Cole no editor SQL
   - Clique em "Run" ou pressione `Ctrl+Enter` (ou `Cmd+Enter` no Mac)

4. **Verifique as Tabelas Criadas**
   - No menu lateral, clique em "Table Editor"
   - Você deverá ver todas as tabelas criadas:
     - User
     - Team
     - TeamMember
     - ReportTemplate
     - ReportSchedule
     - ReportExport
     - Notification
     - Tutorial
     - TutorialProgress
     - OnboardingStep
     - OnboardingProgress
     - AuditLog
     - PredictiveSession
     - PredictiveIntervention
     - PredictiveLabel
     - AbTest
     - AbTestVariant
     - WebhookEndpoint
     - WebhookDelivery
     - ChatThread
     - ChatMessage
     - Tag
     - ChatTag

## Estrutura do Banco

O banco foi criado com:
- ✅ Enums para tipos específicos (PermissionRole, NotificationSeverity, etc)
- ✅ Relações entre tabelas (Foreign Keys)
- ✅ Índices para performance
- ✅ Valores padrão
- ✅ Validações e constraints

## Próximos Passos

Após executar as migrations:

1. Execute `npx prisma generate` para gerar o Prisma Client
2. Inicie o servidor: `npm run dev`
3. Acesse http://localhost:3000

## Troubleshooting

Se houver erros:
- Verifique se os ENUMs já existem (podem dar erro de duplicação)
- Se necessário, delete as tabelas antigas antes de executar novamente
- Certifique-se de que está executando no banco correto
