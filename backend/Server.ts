import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/AuthRoutes';
import userRoutes from './routes/UserRoutes';
import reportRoutes from './routes/ReportRoutes';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import config from '../config/config.json';

import { Nasabah } from './models/Nasabah';
import { Report } from './models/Report';
import csRoutes from './routes/CSRoutes';
import { LayananPelanggan } from './models/LayananPelanggan';
import csReportRoutes from './routes/CSReportRoutes';



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