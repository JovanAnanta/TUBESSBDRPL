// utils/pinUtils.ts
import { NavigateFunction } from 'react-router-dom';

export interface PinNavigationOptions {
  redirectTo: string;
  message?: string;
  data?: any;
}

/**
 * Navigate to PIN verification page with custom redirect destination
 * 
 * @param navigate - React Router navigate function
 * @param options - Navigation options including redirect destination, custom message, and additional data
 * 
 * @example
 * // Basic usage - redirect to transfer page after PIN verification
 * navigateWithPinVerification(navigate, {
 *   redirectTo: '/user/mtransfer/form',
 *   message: 'Masukkan PIN untuk melanjutkan transfer'
 * });
 * 
 * @example
 * // With additional data to pass to next page
 * navigateWithPinVerification(navigate, {
 *   redirectTo: '/user/mtransfer/confirm',
 *   message: 'Konfirmasi transfer dengan PIN',
 *   data: { transferData: formData, amount: 100000 }
 * });
 */
export const navigateWithPinVerification = (
  navigate: NavigateFunction,
  options: PinNavigationOptions
) => {
  navigate('/user/verify-pin', {
    state: {
      redirectTo: options.redirectTo,
      message: options.message || 'Masukkan PIN untuk melanjutkan',
      data: options.data
    }
  });
};

/**
 * Common PIN verification scenarios
 */
export const PinVerificationScenarios = {
  TRANSFER: {
    message: 'Masukkan PIN untuk konfirmasi transfer',
  },
  PAYMENT: {
    message: 'Masukkan PIN untuk konfirmasi pembayaran',
  },
  SETTINGS: {
    message: 'Masukkan PIN untuk mengakses pengaturan',
  },
  BALANCE_CHECK: {
    message: 'Masukkan PIN untuk melihat saldo',
  },
  TRANSACTION_HISTORY: {
    message: 'Masukkan PIN untuk melihat riwayat transaksi',
  }
};
