const oracledb = require('oracledb');
const fs = require('fs')

const connectionConfig = {
  user: 'sankhya',
  password: 'tecsis',
  connectString: '10.140.4.3:1521/snkdbprd'
};

async function conectaEBusca() {
  try {
    // Estabelecer a conexão
    const connection = await oracledb.getConnection(connectionConfig);
    const sql = `
    SELECT * FROM SANKHYA.INTEGRA_FUN
    WHERE EMAIL IS NOT NULL 
    AND (CONTROLE <> 'SUCESSO' OR CONTROLE IS NULL)
    `

    // chamar view do banco com os dados
    const result = await connection.execute(sql);

    const rows = result.rows.map(row => {
      const rowData = {};
      result.metaData.forEach((meta, index) => {
        rowData[meta.name] = row[index];
      });
      return rowData;
    });

    // Fechar a conexão quando terminar de usar
    await connection.close();
    return rows;

  } catch (error) {
    await geraLog(error.message)
    return null;
  }
}

async function conectaEAtualiza(query) {
  try {

    const connection = await oracledb.getConnection(connectionConfig);    
    await connection.execute(query);

    await connection.commit()
    await connection.close();

  } catch (error) {
    console.log(new Date().toISOString().split('T')[0], "- Erro no update controle")
    console.log(error.message)
    await geraLog(error.message, query)
  }
}

async function geraLog(error, query){
  const jsonError = {
    "erro": error,
    "DataEHora": new Date().toLocaleString(),
    "query": query
  }
  fs.writeFileSync(`./logs/error-bd-connect.json`, JSON.stringify(jsonError, null, 2))
}

module.exports = {
  conectaEBusca,
  conectaEAtualiza
}