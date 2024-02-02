const axios = require('axios');
const fs = require('fs')
const conexaoDB = require('../conecta-bd/conectabd.js')

async function fazerChamadaApi(requestData) {

  const apiUrl = 'https://api-mca.dialog.cm/v2/ext/mgmt/employees?params=ldpv&integrationType=partial';
  const headers = {
    'Content-Type': 'application/json',
    'token': 'ffc9eb3d71035d0013768a08ff2a9be091a4f04b1f676d1a685af0c32ff872d60a3c3a05d71a7d28dbbd975c2ac8079c362af210c97890e36ee88636c0c59ad576e0a1cfad6879267745bb0fda319f10e9e938b827b0d1bbe87cfebe4aaaf3d9'
  };

  try {
    const response = await axios.post(apiUrl, requestData, { headers });

    console.log("Feito envio para a API.")

    await gerarUpdateQuery(requestData.employees, 'SUCESSO')

    console.log("Feito update de Controle: Sucesso")

    if (response.data.stderr) {

      await geraLog(response.data.stderr, "erro-negocio")

      if(response.data.stderr.duplicateKeys && response.data.stderr.duplicateKeys.length > 0){
        console.log("Erro retornado pela API: ERRO_NEGOCIO_DUPLICADO")
        await gerarUpdateQuery(response.data.stderr.duplicateKeys[0], 'ERRO_NEGOCIO_DUPLICADO')

      }else if(response.data.stderr.invalidKeys && response.data.stderr.invalidKeys.length > 0){
        console.log("Erro retornado pela API: ERRO_NEGOCIO_CHAVE")
        await gerarUpdateQuery(response.data.stderr.invalidKeys[0], 'ERRO_NEGOCIO_CHAVE')

      }else if(response.data.stderr.invalidFields && response.data.stderr.invalidFields.length > 0){
        console.log("Erro retornado pela API: ERRO_NEGOCIO_CAMPO_INVALIDO")
        await gerarUpdateQuery(response.data.stderr.invalidFields[0], 'ERRO_NEGOCIO_CAMPO_INVALIDO')

      }
      
      console.log("Feito update de Controle: Erro")
    }


  } catch (error) {
    await geraLog(error.message, "erro-conexao")
    await gerarUpdateQuery(requestData.employees, 'ERRO_CONEXAO')
  }
}

async function gerarUpdateQuery(funcionarios, resultado) {
  console.log(`Quantidade de funcionários para fazer update (${resultado}): `, funcionarios.length)
  const queries = funcionarios.map(funcionario => {
    const sql = `
    UPDATE SANKHYA.TFPFUN SET AD_CONTROLE = '${resultado}' WHERE NOMEFUNC = '${funcionario.name}' AND CODFUNC = ${parseInt(funcionario.serial_number)}
    `
    return sql;
  })

  let cont = 1;
  for (const query of queries) {
    await conexaoDB.conectaEAtualiza(query)
    console.log(`Atualizado ${cont++} de ${funcionarios.length}.`)
  }
}

async function geraLog(error, tipo) {
  const jsonError = {
    "erro": error,
    "DataEHora": new Date().toLocaleString()
  }
  fs.writeFileSync(`./logs/${tipo}.json`, JSON.stringify(jsonError, null, 2))
}

module.exports = {
  fazerChamadaApi
}