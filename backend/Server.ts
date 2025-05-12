import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/AuthRoutes';
import UserRoutes from './routes/UserRoutes';
import { Sequelize } from 'sequelize-typescript';
import { Nasabah } from './models/Nasabah';
import config from "../config/config.json";
import cors from "cors";



const sequelize = new Sequelize({
  ...config.development,
  dialect: "postgres",
  models: [Nasabah] // Explicitly cast dialect to Dialect type
});
sequelize.addModels([Nasabah]);

const app = express();
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', UserRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


