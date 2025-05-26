import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { Sequelize } from 'sequelize-typescript';
import config from './config/config.json';
import authRoutes from './routes/AuthRoutes';
import reportRoutes from './routes/ReportRoutes';
import userRoutes from './routes/UserRoutes';

import { Admin } from './models/Admin';
import { Credit } from './models/Credit';
import { Debit } from './models/Debit';
import { LayananPelanggan } from './models/LayananPelanggan';
import { LoginActivity } from './models/LoginActivity';
import { Nasabah } from './models/Nasabah';
import { Pinjaman } from './models/Pinjaman';
import { Report } from './models/Report';
import { Session } from './models/Session';
import { Tagihan } from './models/Tagihan';
import { Transaksi } from './models/Transaksi';
import { Transfer } from './models/Transfer';
import csActivityRoutes from './routes/CSActivityRoutes';
import csReportRoutes from './routes/CSReportRoutes';
import csRoutes from './routes/CSRoutes';
import gantiPasswordRotues from './routes/GantiPasswordRoutes';
import gantiPinRoutes from './routes/GantiPinRoutes';
import PinjamanRoutes from './routes/PinjamanRoutes';
import tagihanRoutes from './routes/TagihanRoutes';

const sequelize = new Sequelize({
  ...config.development,
  dialect: 'postgres',
  models: [
    Nasabah,
    Report,
    LayananPelanggan,
    Transaksi,
    Debit,
    Credit,
    Transfer,
    Tagihan,
    Pinjaman,
    LoginActivity,
    Session,
    Admin,
  ]
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
app.use('/api/pinjaman', PinjamanRoutes);

app.use('/api/cs', csRoutes);
app.use('/api/cs', csReportRoutes);
app.use('/api/cs', csActivityRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});