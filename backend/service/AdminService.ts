import { encrypt, decrypt } from '../enkripsi/Encryptor';
import { Admin } from '../models/Admin';
import bcrypt from 'bcryptjs';
import { Pinjaman } from '../models/Pinjaman';
import { Nasabah } from '../models/Nasabah';
import { Transaksi } from '../models/Transaksi';

export const loginAdminService = async (email: string, password: string) => {
  const encryptedEmail = encrypt(email);
  const admin = await Admin.findOne({ where: { email: encryptedEmail } });

  if (!admin) {
    throw new Error('Admin tidak ditemukan');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new Error('Password salah');
  }

  return admin;
};

export const getPendingPinjamanService = async () => {
  const pinjamans = await Pinjaman.findAll({
    where: { statusPinjaman: 'PENDING' },
    include: [{
      model: Transaksi,
      include: [{
        model: Nasabah,
        attributes: ['nasabah_id', 'nama', 'email'],
      }]
    }]
  });

  return pinjamans.map(pinjaman => ({
    pinjaman_id: pinjaman.pinjaman_id,
    jumlahPinjaman: pinjaman.jumlahPinjaman,
    statusJatuhTempo: pinjaman.statusJatuhTempo,
    tanggalJatuhTempo: pinjaman.tanggalJatuhTempo,
    statusPinjaman: pinjaman.statusPinjaman,
    nasabah: pinjaman.transaksi?.nasabah
      ? {
          nama: decrypt(pinjaman.transaksi.nasabah.nama),
          email: decrypt(pinjaman.transaksi.nasabah.email),
          nasabah_id: pinjaman.transaksi.nasabah.nasabah_id
        }
      : null
  }));
};

export const konfirmasiPinjamanService = async (pinjamanId: string, status: 'DISETUJUI' | 'DITOLAK') => {
  const pinjaman = await Pinjaman.findByPk(pinjamanId);
  if (!pinjaman) {
    throw new Error('Pinjaman tidak ditemukan');
  }

  pinjaman.statusPinjaman = status;
  await pinjaman.save();
  return pinjaman;
};


// export const blokirNasabahService = async (nasabahId: string) => {
//   const nasabah = await Nasabah.findByPk(nasabahId);

//   if (!nasabah) {
//     throw new Error('Nasabah tidak ditemukan');
//   }

//   if (nasabah.status === 'TIDAK AKTIF') {
//     throw new Error('Nasabah sudah tidak aktif');
//   }

//   nasabah.status = 'TIDAK AKTIF';
//   await nasabah.save();

//   return {
//     nama: nasabah.nama,
//     nasabah_id: nasabah.nasabah_id,
//     status: nasabah.status
//   };
// };


export const getAllNasabahService = async () => {
  const nasabahs = await Nasabah.findAll({
    attributes: ['nasabah_id', 'nama', 'email', 'status']
  });

  return nasabahs.map(nasabah => ({
    nasabah_id: nasabah.nasabah_id,
    nama: decrypt(nasabah.nama),
    email: decrypt(nasabah.email),
    status: nasabah.status
  }));
};

export const ubahStatusNasabahService = async (nasabahId: string, status: 'AKTIF' | 'TIDAK AKTIF') => {
  const nasabah = await Nasabah.findByPk(nasabahId);

  if (!nasabah) {
    throw new Error('Nasabah tidak ditemukan');
  }

  if (nasabah.status === status) {
    throw new Error(`Nasabah sudah memiliki status ${status}`);
  }

  nasabah.status = status;
  await nasabah.save();

  return {
    nama: decrypt(nasabah.nama),
    nasabah_id: nasabah.nasabah_id,
    status: nasabah.status
  };
};
