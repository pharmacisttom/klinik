'use client';

import React, { useState } from 'react';
import { saveConsultationAction } from '@/app/actions/clinical';
import { Stethoscope, Plus, Trash2, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface PrescriptionRow {
  medCode: string;
  medName: string;
  qty: number;
  dosage: string;
  price: number;
}

export default function DoctorConsultationPage() {
  const [patientHn, setPatientHn] = useState('HN-690916-0001');
  const [patientName, setPatientName] = useState('นายประณีต สุขใจ');
  const [allergies, setAllergies] = useState<string[]>(['Penicillin']);
  const [chiefComplaint, setChiefComplaint] = useState('เจ็บคอ มีไข้');
  const [icdCode, setIcdCode] = useState('J02.9');
  const [icdDesc, setIcdDesc] = useState('Acute pharyngitis, unspecified');
  const [doctorNotes, setDoctorNotes] = useState('คอแดงโต มีเสมหะ ให้พักผ่อน ดื่มน้ำอุ่น');
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([
    { medCode: 'MED-PARA-500', medName: 'Paracetamol 500mg', qty: 20, dosage: '1 เม็ด หลังอาหาร 3 มื้อ', price: 2.5 },
    { medCode: 'MED-AMOX-500', medName: 'Amoxicillin 500mg', qty: 21, dosage: '1 แคปซูล ก่อนอาหาร 3 มื้อ (ทานติดต่อกันจนหมด)', price: 5.0 },
  ]);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const addMedication = () => {
    setPrescriptions([
      ...prescriptions,
      { medCode: 'MED-LOSA-50', medName: 'Losartan 50mg', qty: 30, dosage: '1 เม็ด หลังอาหารเช้า', price: 8.0 },
    ]);
  };

  const removeMedication = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  const handleCompleteConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const res = await saveConsultationAction({
      patientHn,
      chiefComplaint,
      diagnosisCode: icdCode,
      diagnosisDesc: icdDesc,
      doctorNotes,
      items: prescriptions.map((p) => ({
        medCode: p.medCode,
        qty: p.qty,
        dosage: p.dosage,
      })),
    });

    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        message: 'บันทึกผลการตรวจและสั่งจ่ายยาเรียบร้อย! คิวถูกส่งไปยังห้องยา (Pharmacy) แล้ว',
      });
    } else {
      setStatus({
        type: 'error',
        message: res.error || 'เกิดข้อผิดพลาดในการบันทึกผลการตรวจ',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500 text-white flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ห้องตรวจแพทย์ (Doctor Consultation)</h1>
              <p className="text-slate-500 text-sm">วินิจฉัยโรค (ICD-10) สั่งจ่ายยา และส่งต่อคลังยา</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">
              สถานะ: อยู่ระหว่างการตรวจ
            </span>
          </div>
        </div>

        {/* Quick Patient Select Button for E2E testing */}
        <div className="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-cyan-800">ผู้ป่วยรอนัดตรวจ:</span>
          <button
            type="button"
            onClick={() => {
              setPatientHn('HN-690916-0001');
              setPatientName('ประณีต สุขใจ');
            }}
            className="px-3 py-1 bg-white hover:bg-cyan-100 text-cyan-900 text-xs font-bold rounded-lg border border-cyan-200 transition shadow-sm"
          >
            ประณีต สุขใจ (HN-690916-0001)
          </button>
        </div>

        {/* Patient Allergy Warning Banner */}
        {allergies.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold text-sm">คำเตือนแพ้ยา (Drug Allergy Alert): </span>
              <span className="text-sm font-semibold text-rose-700">{allergies.join(', ')}</span>
            </div>
          </div>
        )}

        {status && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
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

        <form onSubmit={handleCompleteConsultation} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">ผู้ป่วย</label>
              <p className="text-lg font-bold text-slate-900">{patientName} ({patientHn})</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase">สัญญาณชีพคัดกรอง</label>
              <p className="text-sm font-medium text-slate-700">BP: 120/80 mmHg | HR: 78 BPM | Temp: 37.8 °C | BMI: 23.1</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">อาการสำคัญ (Chief Complaint)</label>
            <textarea
              rows={2}
              name="chiefComplaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="เจ็บคอ มีไข้..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">รหัสโรค ICD-10 *</label>
              <input
                type="text"
                name="diagnosisCode"
                required
                value={icdCode}
                onChange={(e) => setIcdCode(e.target.value)}
                placeholder="J02.9"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">คำอธิบายการวินิจฉัย (Diagnosis Description) *</label>
              <input
                type="text"
                name="diagnosisDesc"
                required
                value={icdDesc}
                onChange={(e) => setIcdDesc(e.target.value)}
                placeholder="Acute pharyngitis, unspecified"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">บันทึกของแพทย์ / คำแนะนำ (Doctor Notes)</label>
            <textarea
              rows={3}
              name="doctorNotes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="ข้อแนะนำการปฏิบัติตน การนัดติดตามอาการ..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none"
            />
          </div>

          {/* Prescription Order Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900">รายการสั่งจ่ายยา (Prescription Orders)</h3>
              <button
                type="button"
                onClick={addMedication}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 text-cyan-700 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> เพิ่มรายการยา
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-xs text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">รหัสยา</th>
                    <th className="px-4 py-3">ชื่อยา</th>
                    <th className="px-4 py-3">จำนวน</th>
                    <th className="px-4 py-3">วิธีใช้ยา (Dosage Instructions)</th>
                    <th className="px-4 py-3">ราคา/หน่วย</th>
                    <th className="px-4 py-3 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {prescriptions.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{med.medCode}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{med.medName}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={med.qty}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].qty = parseInt(e.target.value) || 1;
                            setPrescriptions(updated);
                          }}
                          className="w-16 px-2 py-1 border border-slate-300 rounded-md text-center"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={med.dosage}
                          onChange={(e) => {
                            const updated = [...prescriptions];
                            updated[idx].dosage = e.target.value;
                            setPrescriptions(updated);
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded-md"
                        />
                      </td>
                      <td className="px-4 py-3">฿{med.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeMedication(idx)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? 'กำลังสั่งจ่ายยา...' : 'สั่งจ่ายยา และส่งไปคลังยา'}
          </button>
        </form>
      </div>
    </div>
  );
}
