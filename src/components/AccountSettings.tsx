import { useState, FormEvent } from 'react';
import { User as UserIcon, Mail, Lock, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/StateContext';

export function AccountSettings() {
  const { currentUser, updateUser, setCurrentUser } = useAppState();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedToast, setSavedToast] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    const updates: { name: string; email: string; password?: string } = { name, email };
    if (password) updates.password = password;

    updateUser(currentUser.id, updates);
    setCurrentUser({ ...currentUser, ...updates });

    setPassword('');
    setConfirmPassword('');
    setSavedToast('Akun Anda berhasil diperbarui!');
    setTimeout(() => setSavedToast(''), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {savedToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg font-black italic uppercase text-xs tracking-wider">
          <CheckCircle className="w-5 h-5" />
          <span>{savedToast}</span>
        </div>
      )}

      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black italic text-xl border border-blue-100">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 italic uppercase tracking-tight">Pengaturan Akun Pengguna</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentUser.role}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Nama Lengkap</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                required
                type="text"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Alamat Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
              <input
                required
                type="email"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="Kosongkan jika tidak diubah"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Konfirmasi Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black italic uppercase tracking-wider text-[10px] transition-all shadow-md"
          >
            Simpan Perubahan
          </button>
        </form>
      </div>
    </div>
  );
}