'use client';

import React, { useEffect, useState } from 'react';
import { getStaffUsersAction, createStaffUserAction, updateUserRoleAction } from '@/app/actions/clinical';
import { Users, UserPlus, CheckCircle2, ShieldCheck, RefreshCw, KeyRound, Lock, Edit3 } from 'lucide-react';

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
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingRole, setEditingRole] = useState<string>('DOCTOR');
  
  // Create User State
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

  const handleUpdateRole = async (userId: string) => {
    setStatus(null);
    const res = await updateUserRoleAction(userId, editingRole);
    if (res.success) {
      setStatus({ type: 'success', message: `อัปเดตบทบาทหน้าที่เรียบร้อยแล้วเป็น (${editingRole})` });
      setEditingUserId(null);
      fetchUsers();
    } else {
      setStatus({ type: 'error', message: res.error || 'ไม่สามารถปรับเปลี่ยนบทบาทได้' });
    }
  };

  const roleDefinitions = [
    {
      role: 'ADMIN',
      label: 'ผู้ดูแลระบบ (Admin)',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      description: 'สิทธิ์สูงสุด เข้าถึงระบบทั้งหมด การจัดการผู้ใช้งาน กำหนดสิทธิ์ Audit Logs สำรองข้อมูล และ License',
      access: ['/admin/*', '/admin/users', '/admin/audit-logs', '/admin/backups', '/admin/license', '/admin/reports/builder'],
    },
    {
      role: 'DOCTOR',
      label: 'แพทย์ผู้ตรวจ (Doctor)',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      description: 'ห้องตรวจวินิจฉัยโรค สั่งยา วินิจฉัย ICD-10 หัตถการเบื้องต้น/ทำแผล ประวัติ EMR ย้อนหลัง',
      access: ['/doctor/consultation', '/procedures', '/booking', '/pdpa/data-request'],
    },
    {
      role: 'NURSE',
      label: 'พยาบาลคัดกรอง (Nurse)',
      badge: 'bg-teal-100 text-teal-800 border-teal-300',
      description: 'จุดคัดกรองพยาบาล บันทึกสัญญาณชีพ (Vitals) อาการสำคัญ จัดคิวผู้ป่วย ซักประวัติเบื้องต้น',
      access: ['/nurse/screening', '/booking', '/pdpa/data-request'],
    },
    {
      role: 'PHARMACIST',
      label: 'เภสัชกร (Pharmacist)',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      description: 'ห้องจัดยาและจ่ายยา คลังยา สต๊อกการ์ด คลังยาเย็น 2-8°C ตรวจจับการแพ้ยาและรายงาน ADR',
      access: ['/pharmacy', '/pharmacy/stock-card', '/pharmacy/cold-chain', '/pharmacy/adr-report'],
    },
    {
      role: 'CASHIER',
      label: 'เจ้าหน้าที่การเงิน (Cashier)',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
      description: 'การชำระเงิน ออกใบเสร็จรับเงิน ชำระผ่านเงินสด/QR PromptPay สรุปยอดขายและลูกหนี้',
      access: ['/cashier'],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Page Card */}
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">การจัดการบุคลากรและสิทธิ์การใช้งาน (User & Role Management)</h1>
              <p className="text-slate-500 text-sm">กำหนดและแบ่งแยกสิทธิ์ของบุคลากร (RBAC) โดยแอดมิน</p>
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

        {/* Users Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3">อีเมล (Login Identifier)</th>
                <th className="px-4 py-3">บทบาทหน้าที่ปัจจุบัน (Role)</th>
                <th className="px-4 py-3">เบอร์โทรศัพท์</th>
                <th className="px-4 py-3 text-center">การจัดการสิทธิ์โดย Admin</th>
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
                      {editingUserId === u.id ? (
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          className="px-2.5 py-1 border rounded-lg text-xs font-semibold bg-white text-slate-800 focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="ADMIN">ADMIN (ผู้ดูแลระบบ)</option>
                          <option value="DOCTOR">DOCTOR (แพทย์)</option>
                          <option value="NURSE">NURSE (พยาบาล)</option>
                          <option value="PHARMACIST">PHARMACIST (เภสัชกร)</option>
                          <option value="CASHIER">CASHIER (การเงิน)</option>
                        </select>
                      ) : (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                            u.role === 'ADMIN'
                              ? 'bg-purple-100 text-purple-800 border-purple-300'
                              : u.role === 'DOCTOR'
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                              : u.role === 'NURSE'
                              ? 'bg-teal-100 text-teal-800 border-teal-300'
                              : u.role === 'PHARMACIST'
                              ? 'bg-indigo-100 text-indigo-800 border-indigo-300'
                              : u.role === 'CASHIER'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.phone || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {editingUserId === u.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateRole(u.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition"
                          >
                            บันทึกสิทธิ์
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs"
                          >
                            ยกเลิก
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingUserId(u.id);
                            setEditingRole(u.role);
                          }}
                          className="px-3 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" /> เปลี่ยน Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role & Access Permission Matrix */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-bold text-white">ตารางขอบเขตสิทธิ์ตามบทบาทหน้าที่ (Role Permission Matrix)</h2>
            <p className="text-slate-400 text-xs">รายละเอียดการเข้าถึงเมนูและฟังก์ชันงานแต่ละแผนกที่กำหนดโดย Admin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roleDefinitions.map((rd) => (
            <div key={rd.role} className="p-5 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${rd.badge}`}>
                  {rd.role}
                </span>
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="font-bold text-slate-200 text-sm">{rd.label}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{rd.description}</p>
              <div className="pt-2 border-t border-slate-900 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">เส้นทางที่ได้รับอนุญาต (Allowed Routes):</span>
                <div className="flex flex-wrap gap-1">
                  {rd.access.map((route) => (
                    <span key={route} className="font-mono text-[10px] bg-slate-900 text-purple-300 px-2 py-0.5 rounded border border-slate-800">
                      {route}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
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
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                >
                  <option value="DOCTOR">DOCTOR - แพทย์ผู้ตรวจ</option>
                  <option value="NURSE">NURSE - พยาบาลคัดกรอง</option>
                  <option value="PHARMACIST">PHARMACIST - เภสัชกร</option>
                  <option value="CASHIER">CASHIER - การเงิน</option>
                  <option value="ADMIN">ADMIN - ผู้ดูแลระบบ</option>
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
