const express = require('express');
const cron = require('node-cron');
const app = express();
const service = require('./service')

const port = process.env.PORT || 3000;

executaJob();

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

//função principal do app
function executaJob() {
    console.log(new Date().toISOString(), ' - Executando serviço agendado.');
    service.executa()
}

//cron job que executa a cada 10 minutos e chama a função principal
// cron.schedule('*/10 * * * *', executaJob);