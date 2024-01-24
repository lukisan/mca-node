# Node.js Express App

Este app tem como objetivo fazer a integração de alguns dados da base Sankhya com a API dialog. 

## Pré-requisitos

- Node.js instalado (https://nodejs.org/)
- npm (Node Package Manager) - normalmente instalado automaticamente com o Node.js

## Instalação

1. Clone este repositório:

2. Navegue até o diretório do projeto

3. Instale as dependências:
    ```bash
    npm install
    ```
## Executando a aplicação

Execute o seguinte comando para iniciar o servidor:

```bash
    node app.js
```

A aplicação será iniciada e o cron job, configurado para executar duas vezes ao dia, irá inicar o processo.

### Nota
A rota padrão (/) foi removida, pois o foco principal é o cron job.