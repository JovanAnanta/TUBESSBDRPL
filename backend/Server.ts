import express from 'express';
import bodyParser from 'body-parser';
import authRoutes from './routes/AuthRoutes';
import userRoutes from './routes/UserRoutes';
import reportRoutes from './routes/ReportRoutes';
import { Sequelize } from 'sequelize-typescript';
import cors from 'cors';
import config from './config/config.json';

import { Nasabah } from './models/Nasabah';
import { Report } from './models/Report';
import { Tagihan } from './models/Tagihan';
import { Transaksi } from './models/Transaksi';
import { Credit } from './models/Credit';
import { Debit } from './models/Debit';
import { Transfer } from './models/Transfer';
import { Pinjaman } from './models/Pinjaman';
import csRoutes from './routes/CSRoutes';
import { LayananPelanggan } from './models/LayananPelanggan';
import csReportRoutes from './routes/CSReportRoutes';
import csActivityRoutes from './routes/CSActivityRoutes';
import gantiPasswordRotues from './routes/GantiPasswordRoutes';
import gantiPinRoutes from './routes/GantiPinRoutes';
import tagihanRoutes from './routes/TagihanRoutes';
import { LoginActivity } from './models/LoginActivity';
import { Session } from './models/Session';
import { Admin } from './models/Admin';
import adminRoutes from './routes/AdminRoutes';

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

app.use('/api/cs', csRoutes);
app.use('/api/cs', csReportRoutes);
app.use('/api/cs', csActivityRoutes);

app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});