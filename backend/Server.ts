import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import config from './config/config.json';
import authRoutes from './routes/AuthRoutes';
import reportRoutes from './routes/ReportRoutes';
import userRoutes from './routes/UserRoutes';

import { LayananPelanggan } from './models/LayananPelanggan';
import { Nasabah } from './models/Nasabah';
import { Report } from './models/Report';
import csReportRoutes from './routes/CSReportRoutes';
import csRoutes from './routes/CSRoutes';



const sequelize = new Sequelize({
  ...config.development,
  dialect: 'postgres',
  models: [Nasabah, Report, LayananPelanggan]
});

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/report', reportRoutes);

app.use('/api/cs', csRoutes);
app.use('/api/cs', csReportRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});