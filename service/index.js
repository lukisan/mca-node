const conexaoDB = require('../conecta-bd/conectabd.js')
const api = require('../chama-api/envia-dados.js')

async function executa(){

    //faz chamada no banco e retorna os dados da view
    const result = await conexaoDB.conectaEBusca()

    if(result){
        const dadosFinais = trataDados(result)
        console.log("Feito busca no banco...")
    
        //executa metodo que envia para a api os dados no formato esperado.
        await api.fazerChamadaApi(dadosFinais)
        console.log(new Date().toISOString(), ' - Finalizando execução...')
        console.log()
    }else{
        console.log("Tentativa de conexão ao banco falhou! Verificar arquivo com log: logs/error-bd-connection.json\n")
    }
}

function trataDados(dados){
    const employees = dados.map(funcionario => {
        return {
            "name": funcionario.NAME,
            "status": funcionario.STATUS == 'true',
            "serial_number": funcionario.SERIAL_NUMBER + '',
			"email": funcionario.EMAIL,
			"job_description": funcionario.JOB_DESCRIPTION,
			"department": funcionario.DEPARTMENT,
			"birthdate": funcionario.BIRTHDATE.toISOString().split('T')[0],
			"cod_area": funcionario.COD_AREA + ''
        }
    })
    
    return {
        "employees": employees
    };
}

module.exports = {
    executa
}