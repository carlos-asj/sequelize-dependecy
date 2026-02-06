import { Client, Equip } from "../models/index.js";

export const getAllClients = async (req, res) => {
    try {
    const clients = await Client.findAll({
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
    await Client.create(clientObj);
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
      console.log('🔍 Model Cliente:', Client?.name);
      console.log('🔍 Model Equipamento:', Equip?.name);

      console.log('🔗 Associações do Equipamento:', Object.keys(Equip.associations || {}));
      
      // Verificar se os modelos foram carregados
      if (!Client || !Equip) {
        throw new Error('Modelos não carregados corretamente');
      }
      
      // Configurar INCLUDE
      const includeOptions = [];
      
      if (incluirCliente === 'true') {
        includeOptions.push({
          model: Client, // ← Use a variável Cliente importada
          as: 'client',  // ← DEVE ser 'cliente' (minúsculo)
          attributes: ['id', 'name', 'cpf_cnpj']
        });
        
        console.log('✅ Incluindo cliente na consulta');
      }
      
      // Executar consulta
      const { count, rows: equips } = await Equip.findAndCountAll({
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
        console.log('⚠️  Usando solução alternativa...');
        return await this.listarEquipamentosAlternativo(req, res);
      }
      
      return res.status(500).json({
        erro: true,
        mensagem: 'Erro interno do servidor',
        detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    };
};


export const addEquip = async (req, res) => {
  const equipObj = req.body;

  try {
    await Equip.create(equipObj);
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