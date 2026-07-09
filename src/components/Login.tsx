/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Mail, Lock, LogIn, ShieldCheck, UserPlus, User as UserIcon, ArrowLeft, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AleraSightLogo } from './Logo';
import { User, Role } from '../types';

interface LoginProps {
  users: User[];
  onRegister: (newUser: Omit<User, 'id'>) => void;
  onLogin: (user: User) => void;
}

export function Login({ users, onRegister, onLogin }: LoginProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('Operator');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // Find the user by email (case-insensitive)
      const foundUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!foundUser) {
        setError('Alamat email tidak terdaftar! Silakan daftarkan akun baru terlebih dahulu.');
        setLoading(false);
        return;
      }

      // Check Password
      // Preloaded/Default users don't have password defined, allow 'password' as fallback
      const storedPassword = foundUser.password || 'password';
      if (password !== storedPassword) {
        setError('Kata sandi salah! Catatan: Akun bawaan menggunakan sandi "password".');
        setLoading(false);
        return;
      }

      // Success
      onLogin(foundUser);
      setLoading(false);
    }, 1200);
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validations
    if (!regName.trim()) {
      setError('Nama lengkap wajib diisi!');
      return;
    }
    if (!regEmail.trim()) {
      setError('Alamat email wajib diisi!');
      return;
    }
    const emailExists = users.some(u => u.email.toLowerCase() === regEmail.trim().toLowerCase());
    if (emailExists) {
      setError('Email sudah terdaftar! Gunakan email lain atau masuk.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Kata sandi minimal harus 6 karakter!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const newUserInput = {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        role: regRole,
        password: regPassword
      };

      // Register new user into the global state
      onRegister(newUserInput);
      
      setSuccess('Registrasi berhasil! Akun Anda telah tersimpan ke dalam sistem.');
      setLoading(false);

      // Auto login the newly registered user
      setTimeout(() => {
        // Find the newly registered user (which was added to the state)
        const loggedUser: User = {
          id: `USR-${Math.floor(Math.random() * 1000)}`, // temporary fallback ID for direct login payload
          ...newUserInput
        };
        onLogin(loggedUser);
      }, 1500);

    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden select-none">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-600/15 blur-[140px] rounded-full"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-red-600/15 blur-[140px] rounded-full"></div>
      </div>

      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        className="w-full max-w-lg bg-slate-950/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-6">
          <AleraSightLogo showTagline={false} size={50} isDarkTheme={true} className="mb-3 transform scale-105" />
          <h2 className="text-white font-black uppercase tracking-wider text-lg italic mt-2">ALERASIGHT HOMEGUARD</h2>
          <p className="text-blue-300 text-[10px] uppercase tracking-[0.2em] font-extrabold italic text-center mt-1">Sistem Monitoring Kebakaran Terpadu</p>
        </div>

        {/* Info alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 bg-red-950/55 border border-red-500/30 rounded-2xl flex items-start gap-3 text-xs text-red-200"
            >
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold uppercase italic tracking-wider">Kesalahan Sistem</p>
                <p className="mt-0.5 font-medium leading-relaxed">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-4 bg-emerald-950/55 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-xs text-emerald-200"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold uppercase italic tracking-wider">Berhasil</p>
                <p className="mt-0.5 font-medium leading-relaxed">{success}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!isRegisterMode ? (
            // SIGN IN FORM
            <motion.div
              key="signin"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1.5 italic">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="email"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white text-xs placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="contoh@alerasight.id"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 italic">Kata Sandi</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-10 text-white text-xs placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="Masukkan kata sandi Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-blue-300">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5 text-blue-600 focus:ring-0 focus:ring-offset-0" />
                    Ingat Sesi Saya
                  </label>
                  <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded-md text-blue-400 font-bold border border-white/5">
                    Tips: Sandi bawaan adalah &apos;password&apos;
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-extrabold uppercase italic tracking-widest text-[11px] py-3.5 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Masuk ke Sistem
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-white/5 text-center">
                <p className="text-slate-400 text-xs font-semibold">
                  Belum memiliki akses?{' '}
                  <button
                    onClick={() => {
                      setIsRegisterMode(true);
                      setError('');
                      setSuccess('');
                    }}
                    className="text-blue-400 hover:text-blue-300 transition-colors font-extrabold uppercase text-[10px] tracking-wider underline ml-1"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </motion.div>
          ) : (
            // REGISTER (SIGN UP) FORM
            <motion.div
              key="register"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1 italic">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-xs placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="Masukkan nama lengkap"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1 italic">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="email"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-xs placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="contoh@alerasight.id"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1 italic">Hak Akses / Peran</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as Role)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl py-2.5 px-3 text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                    >
                      <option value="Operator">Operator</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1 italic">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                      <input
                        type="password"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-xs placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                        placeholder="Min. 6 karakter"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-blue-200 mb-1 italic">Konfirmasi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                    <input
                      type="password"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-white text-xs placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all font-medium"
                      placeholder="Konfirmasi kata sandi"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-extrabold uppercase italic tracking-widest text-[11px] py-3.5 rounded-xl shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Daftar &amp; Masuk Dashboard
                    </>
                  )}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(false);
                  setError('');
                  setSuccess('');
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 transition-colors font-extrabold uppercase text-[10px] tracking-wider"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Halaman Masuk
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-5 border-t border-white/5 text-center">
          <div className="flex items-center justify-center gap-2 text-blue-200/40 text-[9px] font-black uppercase tracking-widest leading-none">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            Secured Infrastructure by IoT Core Gateway
          </div>
        </div>
      </motion.div>
    </div>
  );
}
