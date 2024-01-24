const axios = require('axios');
const fs = require('fs')
const conexaoDB = require('../conecta-bd/conectabd.js')

async function fazerChamadaApi(requestData) {

  const apiUrl = 'https://api-mca.dialog.qa/v2/ext/mgmt/employees?params=ldpv&integrationType=partial';
  const headers = {
    'Content-Type': 'application/json',
    'token': '95dd31679b94d581dd72009de0858a0545db2ab2b67b7532409b27a46233f46b58d8b81b77077f0dabff91520a968c2ac45eb69adfc305cfa545f765c8d6f186b38b03cb6daa24903e17f828a51319be539377116ec814e3504c995f563d7795'
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
  const queries = funcionarios.map(funcionario => {
    const sql = `
    UPDATE TFPFUN SET AD_CONTROLE = '${resultado}' WHERE NOMEFUNC = '${funcionario.name}' AND CODFUNC = ${parseInt(funcionario.serial_number)}
    `
    return sql;
  })

  for (const query of queries) {
    await conexaoDB.conectaEAtualiza(query)
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