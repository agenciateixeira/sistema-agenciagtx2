# 🤖 GitHub Actions - Cron Job GRATUITO

Este sistema usa GitHub Actions para executar o job de detecção de carrinhos abandonados **automaticamente e de graça** a cada 5 minutos.

## ✅ Vantagens do GitHub Actions

- 🆓 **100% Gratuito** (2000 minutos/mês grátis)
- 🔄 **Automático** (sem precisar Vercel Pro)
- 📊 **Logs completos** no GitHub
- ⚡ **Confiável** e escalável

## 🔧 Configuração (3 passos simples)

### Passo 1: Adicionar Secrets no GitHub

1. Acesse seu repositório no GitHub
2. Vá em **Settings → Secrets and variables → Actions**
3. Clique em **New repository secret**
4. Adicione estes 2 secrets:

#### Secret 1: `APP_URL`
```
Nome: APP_URL
Valor: https://seu-dominio.vercel.app
```
> ⚠️ **Importante**: Sem `/` no final

#### Secret 2: `CRON_SECRET`
```
Nome: CRON_SECRET
Valor: um-token-secreto-aleatorio-aqui
```
> 💡 **Dica**: Use um gerador de UUID ou senha forte

**Exemplo de secrets configurados:**
```
APP_URL = https://sistema-agenciagtx.vercel.app
CRON_SECRET = abc123xyz789segredo456
```

### Passo 2: Deploy na Vercel

Certifique-se que a variável de ambiente `CRON_SECRET` está configurada na Vercel:

1. Painel Vercel → **Settings → Environment Variables**
2. Adicione:
   ```
   Nome: CRON_SECRET
   Valor: abc123xyz789segredo456
   ```
   > ⚠️ Use o **mesmo valor** do GitHub secret

### Passo 3: Push para o GitHub

```bash
git push origin main
```

Pronto! O workflow já está configurado e vai rodar automaticamente.

## 🎯 Como Funciona

```
A cada 5 minutos:
  ↓
GitHub Actions inicia workflow
  ↓
Faz chamada HTTP para:
  GET https://seu-app.vercel.app/api/jobs/detect-abandoned-carts
  Header: Authorization: Bearer SEU_CRON_SECRET
  ↓
Sistema processa carrinhos abandonados
  ↓
Envia emails de recuperação
  ↓
Workflow finaliza com sucesso ✅
```

## 📊 Monitorar Execuções

### Ver Logs das Execuções

1. Acesse o repositório no GitHub
2. Vá em **Actions**
3. Clique em **Abandoned Cart Detection**
4. Veja todas as execuções:
   - ✅ Verde = Sucesso
   - ❌ Vermelho = Erro
5. Clique em qualquer execução para ver logs detalhados

### Testar Manualmente

1. Vá em **Actions**
2. Clique em **Abandoned Cart Detection**
3. Clique em **Run workflow**
4. Selecione a branch `main`
5. Clique em **Run workflow**

Você vai ver a execução em tempo real!

## 🔍 Troubleshooting

### ❌ Erro: "Error: HTTP 401"

**Problema**: Secrets não estão configurados corretamente

**Solução**:
1. Verifique se `APP_URL` está sem `/` no final
2. Verifique se `CRON_SECRET` é o mesmo no GitHub e na Vercel
3. Faça um novo deploy na Vercel após adicionar a variável

### ❌ Erro: "curl: (6) Could not resolve host"

**Problema**: `APP_URL` está incorreto

**Solução**:
1. Verifique se a URL está correta
2. Certifique-se que o app está deployado na Vercel
3. Teste a URL no navegador: `https://seu-app.vercel.app`

### ⚠️ Workflow não está rodando

**Possíveis causas**:
1. O repositório é privado e você está no plano Free (GitHub Actions funciona, mas verifique minutos disponíveis)
2. O arquivo `.github/workflows/abandoned-cart-cron.yml` não está na branch `main`
3. O workflow está desabilitado (vá em Actions e habilite)

**Solução**:
```bash
git status  # Verificar se o arquivo está commitado
git push origin main  # Enviar para o GitHub
```

## ⏱️ Frequência do Cron

Atualmente: **A cada 5 minutos**

Para alterar, edite `.github/workflows/abandoned-cart-cron.yml`:

```yaml
schedule:
  - cron: '*/5 * * * *'   # A cada 5 minutos
  - cron: '*/10 * * * *'  # A cada 10 minutos
  - cron: '0 * * * *'     # A cada hora
  - cron: '0 */2 * * *'   # A cada 2 horas
```

Formato: `minuto hora dia mês dia-da-semana`

## 💰 Limites Gratuitos

**GitHub Actions - Plano Free:**
- ✅ 2000 minutos/mês grátis
- ✅ Repositórios públicos: minutos ilimitados
- ✅ Repositórios privados: 2000 minutos/mês

**Cálculo:**
- Cada execução: ~10 segundos
- 5 minutos = 12 execuções/hora
- 24 horas = 288 execuções/dia
- 30 dias = 8640 execuções/mês
- Tempo total: ~1440 minutos/mês

✅ **Dentro do limite gratuito!**

## 🎉 Pronto!

Após configurar os secrets e fazer push:
1. ✅ Workflow rodará automaticamente a cada 5 minutos
2. ✅ Carrinhos abandonados serão detectados
3. ✅ Emails de recuperação serão enviados
4. ✅ Estatísticas aparecerão em `/recovery`

**Não precisa fazer mais nada!** 🚀
