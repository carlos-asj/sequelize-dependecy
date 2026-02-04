import express from "express";
import { addClient, addEquip, getAllClients, getAllEquips } from "../controller/controller.js";

const router = express.Router();

router.get("/client", getAllClients);
router.get("/equip", getAllEquips);


router.post("/client", addClient);
router.post("/equip", addEquip);

export default router;