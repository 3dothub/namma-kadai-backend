import express from "express";
import { testMongoConnection } from "../controllers/mongo.controller";

const router = express.Router();

router.get("/test", testMongoConnection);

export default router;
