import { ClientModel, EquipModel } from "../../config/database.js";

export const getAllClients = async (req, res) => {
    try {
    const clients = await ClientModel.findAll({
        attributes: ['id', 'name', 'cpf_cnpj', 'createdAt'],
        order: [['createdAt', 'DESC']]
    });

    if (clients.length == 0){
        return res.status(200).json({
        message: "Clients not found"
        });
    };

    return res.status(200).json({clients});
    } catch (error) {
    console.log(error);
    return res.status(500).json({
        error: "Internal server error"
        });
    };
}

export const addClient = async (req, res) => {
  const clientObj = req.body;

  try {
    await ClientModel.create(clientObj);
    return res.status(201).json({
        message: "Client created!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error"
    })
  }
};

export const getAllEquips = async (req, res) => {
    try {
      const { pagina = 1, limite = 10, incluirCliente = 'true' } = req.query;
      const offset = (pagina - 1) * limite;
      
      console.log('🔍 Parâmetros:', { pagina, limite, incluirCliente });
      console.log('🔍 Modelo Cliente:', ClientModel?.name);
      console.log('🔍 Modelo Equipamento:', EquipModel?.name);

      console.log('🔗 Associações do Equipamento:', Object.keys(EquipModel.associations || {}));
      
      // Verificar se os modelos foram carregados
      if (!ClientModel || !EquipModel) {
        throw new Error('Modelos não carregados corretamente');
      }
      
      // Configurar INCLUDE
      const includeOptions = [];
      
      if (incluirCliente === 'true') {
        includeOptions.push({
          model: ClientModel, // ← Use a variável Cliente importada
          as: 'client',  // ← DEVE ser 'cliente' (minúsculo)
          attributes: ['id', 'name', 'cpf_cnpj']
        });
        
        console.log('✅ Incluindo cliente na consulta');
      }
      
      // Executar consulta
      const { count, rows: equips } = await EquipModel.findAndCountAll({
        include: includeOptions,
        limit: parseInt(limite),
        offset: offset,
        order: [['name', 'ASC']]
      });
      
      console.log(`✅ Encontrados ${equips.length} equips`);
      
      // Formatar resposta
      const equipsFormatados = equips.map(equip => {
        const eq = equip.toJSON();
        
        if (incluirCliente !== 'true') {
          return {
            id: eq.id,
            name: eq.name,
            client_id: eq.client_id
          };
        }
        
        return {
          id: eq.id,
          name: eq.name,
          client: eq.client ? {
            id: eq.client.id,
            name: eq.client.name,
            cpf_cnpj: eq.client.cpf_cnpj
          } : { id: eq.client_id, name: 'Não encontrado' }
        };
      });
      
      return res.json({
        erro: false,
        equips: equipsFormatados,
        paginacao: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total: count,
          totalPaginas: Math.ceil(count / limite)
        }
      });
    } catch (error) {
      console.log(error);
      console.error('❌ ERRO DETALHADO:', error);
      console.error('❌ Stack trace:', error.stack);
      
      // Verificar tipo específico de erro
      if (error.name === 'SequelizeEagerLoadingError') {
        return res.status(500).json({
          erro: true,
          mensagem: 'Erro na associação de modelos',
          detalhes: 'Verifique as associações entre Cliente e Equipamento',
          error: error.message
        });
      }
      
      return res.status(500).json({
        erro: true,
        mensagem: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    };
}

export const addEquip = async (req, res) => {
  const equipObj = req.body;

  try {
    await EquipModel.create(equipObj);
    return res.status(201).json({
        message: "Equip created!"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error"
    })
  }
};