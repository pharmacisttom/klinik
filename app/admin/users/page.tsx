'use client';

import React, { useEffect, useState } from 'react';
import { getStaffUsersAction, createStaffUserAction } from '@/app/actions/clinical';
import { Users, UserPlus, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  createdAt: Date | string;
}

export default function StaffUsersPage() {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getStaffUsersAction();
    setLoading(false);
    if (res.success && res.users) {
      setUsers(res.users as any);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const res = await createStaffUserAction({
      name,
      email,
      role,
      phone,
    });

    if (res.success) {
      setStatus({ type: 'success', message: `สร้างบัญชีผู้ใช้งาน ${name} (${role}) เรียบร้อยแล้ว!` });
      setShowModal(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchUsers();
    } else {
      setStatus({ type: 'error', message: res.error || 'ไม่สามารถสร้างบัญชีบุคลากรได้' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">การจัดการบุคลากรคลินิก (Staff & Role Management)</h1>
              <p className="text-slate-500 text-sm">บริหารจัดการสิทธิ์ผู้ใช้งานแยกตามบทบาท แพทย์ พยาบาล เภสัชกร แคชเชียร์ และผู้ดูแลระบบ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl transition shadow flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" /> เพิ่มบุคลากรใหม่
          </button>
        </div>

        {status && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3">อีเมล (Email / Login)</th>
                <th className="px-4 py-3">บทบาทหน้าที่ (Role)</th>
                <th className="px-4 py-3">เบอร์โทรศัพท์</th>
                <th className="px-4 py-3 text-right">วันที่สร้างบัญชี</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> กำลังโหลดรายชื่อบุคลากร...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'DOCTOR'
                            ? 'bg-cyan-100 text-cyan-800'
                            : u.role === 'NURSE'
                            ? 'bg-teal-100 text-teal-800'
                            : u.role === 'PHARMACIST'
                            ? 'bg-indigo-100 text-indigo-800'
                            : u.role === 'CASHIER'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.phone || '-'}</td>
                    <td className="px-4 py-3 text-right text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Staff User */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 border-b pb-3">เพิ่มบุคลากรคลินิกใหม่</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="นพ. สมนึก ชำนาญการ"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมลผู้ใช้งาน *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor.somnuk@klinik.local"
                  className="w-full px-3 py-2 border rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">บทบาทหน้าที่ (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                >
                  <option value="DOCTOR">แพทย์ (DOCTOR)</option>
                  <option value="NURSE">พยาบาล (NURSE)</option>
                  <option value="PHARMACIST">เภสัชกร (PHARMACIST)</option>
                  <option value="CASHIER">เจ้าหน้าที่การเงิน (CASHIER)</option>
                  <option value="ADMIN">ผู้ดูแลระบบ (ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812345678"
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold text-sm shadow"
                >
                  สร้างบัญชี
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
