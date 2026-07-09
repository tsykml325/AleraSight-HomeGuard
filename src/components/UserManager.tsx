import { useState, FormEvent } from 'react';
import { Plus, Edit2, Trash2, Search, User as UserIcon, Mail, Shield, X, Lock, KeyRound, CheckCircle } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { User, Role } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UserManagerProps {
  currentUser?: User | null;
}

export function UserManager({ currentUser }: UserManagerProps) {
  const { users, addUser, updateUser, deleteUser, resetUserPassword, searchTerm, setSearchTerm } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [savedToast, setSavedToast] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Operator' as Role,
    password: ''
  });

  const handleAddOrEditUser = (e: FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.id, {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password || 'password'
      });
      setSavedToast(`Profil ${newUser.name} berhasil diperbarui!`);
    } else {
      addUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password || 'password'
      });
      setSavedToast(`Pengguna baru ${newUser.name} berhasil didaftarkan!`);
    }
    setIsModalOpen(false);
    setNewUser({ name: '', email: '', role: 'Operator', password: '' });
    setEditingUser(null);
    setTimeout(() => setSavedToast(''), 3000);
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setNewUser({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || 'password'
    });
    setIsModalOpen(true);
  };

  const handleResetPasswordClick = (user: User) => {
    resetUserPassword(user.id);
    setSavedToast(`Instruksi pemulihan sandi dikirim ke ${user.email}`);
    setTimeout(() => setSavedToast(''), 3500);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {savedToast && (
        <div className="p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-lg font-black italic uppercase text-xs tracking-wider animate-bounce">
          <CheckCircle className="w-5 h-5" />
          <span>{savedToast}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari pengguna berdasarkan nama, email, atau hak akses..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 text-xs font-bold uppercase tracking-wider transition-all placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {currentUser?.role === 'Admin' && (
          <button 
            onClick={() => {
              setEditingUser(null);
              setNewUser({ name: '', email: '', role: 'Operator', password: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2.5 px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-md active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengguna Baru
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic">
                <th className="px-8 py-5">Profil Pengguna</th>
                <th className="px-8 py-5">Kontak Elektronik</th>
                <th className="px-8 py-5">Hak Akses</th>
                <th className="px-8 py-5 text-right">Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black italic text-sm border border-blue-100">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 italic uppercase leading-none">{user.name}</p>
                        <span className="text-[9px] text-slate-400 font-mono font-bold block mt-1">{user.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold italic">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold italic leading-none">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>SANDI:</span>
                        <span className="font-mono font-black bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700 uppercase tracking-wide">
                          {currentUser?.role === 'Admin' ? (user.password || 'password') : '••••••••'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Shield className={cn(
                        "w-4 h-4",
                        user.role === 'Admin' ? "text-red-500" : "text-blue-500"
                      )} />
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase italic tracking-wider border leading-none shadow-sm",
                        user.role === 'Admin' ? "bg-red-50 text-red-700 border-red-100" : "bg-blue-50 text-blue-700 border-blue-100"
                      )}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    {currentUser?.role === 'Admin' ? (
                      <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleResetPasswordClick(user)}
                          title="Reset Sandi"
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(user)}
                          title="Edit Profil"
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id)}
                          title="Hapus Akses"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-400 italic">HANYA LIHAT</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-slate-400 font-black italic uppercase tracking-wider">
                    Tidak ada log pengguna yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit User */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border border-slate-200"
            >
              <div className="p-6 bg-slate-900 text-white relative">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white shadow-lg shadow-blue-900/10">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black italic uppercase tracking-tight leading-none">
                  {editingUser ? 'Perbarui Profil Pengguna' : 'Registrasi Pengguna Baru'}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1.5">Kredensial Portal AleraSight HomeGuard</p>
              </div>

              <form onSubmit={handleAddOrEditUser} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
                      placeholder="Contoh: Budi Santoso"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
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
                      placeholder="budi@iot.com"
                      value={newUser.email}
                      disabled={!!editingUser}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Password Sandi</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <input 
                      required
                      type="text" 
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                      placeholder="Masukkan kata sandi baru"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block font-black">Role / Hak Akses</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['Admin', 'Operator'] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewUser({...newUser, role})}
                        className={cn(
                          "py-3.5 px-4 rounded-xl border font-black italic uppercase tracking-widest text-[9px] transition-all text-center",
                          newUser.role === role 
                            ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                        )}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 border border-slate-200 text-slate-500 rounded-xl font-black italic uppercase tracking-wider text-[10px] hover:bg-slate-50 transition-all text-center"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-black italic uppercase tracking-wider text-[10px] hover:bg-black transition-all text-center shadow-md"
                  >
                    {editingUser ? 'Update Profil' : 'Daftarkan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
