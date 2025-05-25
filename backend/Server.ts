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
import { Tagihan } from './models/Tagihan';
import { Transaksi } from './models/Transaksi';
import { Credit } from './models/Credit';
import { Debit } from './models/Debit';
import { Transfer } from './models/Transfer';
import csReportRoutes from './routes/CSReportRoutes';
import csRoutes from './routes/CSRoutes';
import gantiPasswordRotues from './routes/GantiPasswordRoutes';
import gantiPinRoutes from './routes/GantiPinRoutes';
import tagihanRoutes from './routes/TagihanRoutes';



const sequelize = new Sequelize({
  ...config.development,
  dialect: 'postgres',
  models: [Nasabah, Report, LayananPelanggan, Tagihan, Transaksi, Credit, Debit, Transfer],
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
app.use('/api/tagihan', tagihanRoutes);
app.use('/api/nasabah', gantiPinRoutes);
app.use('/api/nasabah', gantiPasswordRotues);

app.use('/api/cs', csRoutes);
app.use('/api/cs', csReportRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});