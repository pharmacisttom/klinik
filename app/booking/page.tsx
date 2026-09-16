'use client';

import React, { useState } from 'react';
import { createPatientAction } from '@/app/actions/patient';
import { validateThaiNationalID } from '@/lib/utils/thai-id';
import { UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BookingPage() {
  const [nationalId, setNationalId] = useState('');
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1990-01-01');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [phone, setPhone] = useState('');
  const [allergies, setAllergies] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const isNationalIdValid = validateThaiNationalID(nationalId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNationalIdValid) {
      setStatus({ type: 'error', message: 'กรุณาระบุเลขประจำตัวประชาชน 13 หลักที่ถูกต้อง' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const res = await createPatientAction({
      nationalId,
      prefix,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      allergies: allergies ? allergies.split(',').map((s) => s.trim()) : [],
      chronicDiseases: [],
      address,
    });

    setLoading(false);

    if (res.success && res.patient) {
      setStatus({
        type: 'success',
        message: `ลงทะเบียนผู้ป่วยเรียบร้อยแล้ว! รหัสประจำตัว (HN): ${res.patient.hn}`,
      });
      // Reset form
      setNationalId('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setAddress('');
      setAllergies('');
    } else {
      setStatus({ type: 'error', message: res.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ลงทะเบียนผู้ป่วยใหม่ / เปิดเวชระเบียน</h1>
            <p className="text-slate-500 text-sm">สร้างรหัส HN อัตโนมัติและตรวจสอบเลขบัตรประชาชน 13 หลัก</p>
          </div>
        </div>

        {status && (
          <div
            className={`p-4 rounded-xl mb-6 flex items-center gap-3 text-sm font-medium ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* National ID with Realtime Validation */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              เลขประจำตัวประชาชน 13 หลัก *
            </label>
            <div className="relative">
              <input
                type="text"
                name="nationalId"
                required
                maxLength={13}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                placeholder="1100400XXXXXX"
                className={`w-full px-4 py-2.5 rounded-xl border text-slate-900 font-mono focus:ring-2 outline-none ${
                  nationalId.length === 13
                    ? isNationalIdValid
                      ? 'border-emerald-500 ring-emerald-200 bg-emerald-50/20'
                      : 'border-red-500 ring-red-200 bg-red-50/20'
                    : 'border-slate-300 focus:ring-emerald-500'
                }`}
              />
              {nationalId.length === 13 && (
                <span
                  className={`absolute right-3 top-2.5 text-xs font-semibold px-2 py-1 rounded-md ${
                    isNationalIdValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isNationalIdValid ? 'ถูกต้อง (Valid)' : 'เลขบัตรไม่ถูกต้อง'}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">คำนำหน้าชื่อ</label>
              <select
                name="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="นาย">นาย</option>
                <option value="นาง">นาง</option>
                <option value="นางสาว">นางสาว</option>
                <option value="เด็กชาย">เด็กชาย</option>
                <option value="เด็กหญิง">เด็กหญิง</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ชื่อจริง *</label>
              <input
                type="text"
                name="firstName"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="ประณีต"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">นามสกุล *</label>
              <input
                type="text"
                name="lastName"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="สุขใจ"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">วันเกิด *</label>
              <input
                type="date"
                name="dateOfBirth"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">เพศ *</label>
              <select
                name="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="MALE">ชาย (Male)</option>
                <option value="FEMALE">หญิง (Female)</option>
                <option value="OTHER">อื่นๆ (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                name="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812345678"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">ประวัติการแพ้ยา (ระบุคั่นด้วยเครื่องหมายจุลภาค)</label>
            <input
              type="text"
              name="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Penicillin, Sulfa, Aspirin"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">ที่อยู่ปัจจุบัน *</label>
            <textarea
              rows={3}
              name="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123/45 ถนนสุขุมวิท กรุงเทพฯ 10110"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 gradient-bg text-white font-semibold rounded-xl hover:opacity-95 transition shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {loading ? 'กำลังลงทะเบียน...' : 'บันทึกเปิดเวชระเบียนผู้ป่วยใหม่'}
          </button>
        </form>
      </div>
    </div>
  );
}
