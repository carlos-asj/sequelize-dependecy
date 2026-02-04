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
    const equips = await EquipModel.findAll({
        attributes: ['id', 'client_id', 'name', 'serial_num', 'createdAt'],
        order: [['createdAt', 'DESC']]
    });

    if (equips.length == 0){
        return res.status(200).json({
        message: "Equips not found"
        });
    };

    return res.status(200).json({equips});
    } catch (error) {
    console.log(error);
    return res.status(500).json({
        error: "Internal server error"
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