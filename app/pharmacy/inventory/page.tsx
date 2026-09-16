'use client';

import React, { useEffect, useState } from 'react';
import { getInventoryAction, addOrUpdateMedicationAction } from '@/app/actions/clinical';
import { Package, Plus, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { formatTHB } from '@/lib/utils/formatters';

interface MedicationItem {
  id: string;
  code: string;
  name: string;
  genericName: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  reorderLevel: number;
}

export default function InventoryPage() {
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('MED-PARA-500');
  const [name, setName] = useState('Paracetamol 500mg');
  const [genericName, setGenericName] = useState('Acetaminophen');
  const [category, setCategory] = useState('Analgesics');
  const [unit, setUnit] = useState('Tablet');
  const [pricePerUnit, setPricePerUnit] = useState('2.5');
  const [stockQuantity, setStockQuantity] = useState('500');
  const [reorderLevel, setReorderLevel] = useState('100');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    const res = await getInventoryAction();
    setLoading(false);
    if (res.success && res.medications) {
      setMedications(res.medications as any);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSaveMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const res = await addOrUpdateMedicationAction({
      code,
      name,
      genericName,
      category,
      unit,
      pricePerUnit: parseFloat(pricePerUnit) || 0,
      stockQuantity: parseInt(stockQuantity) || 0,
      reorderLevel: parseInt(reorderLevel) || 50,
    });

    if (res.success) {
      setStatus({ type: 'success', message: `ปรับปรุงข้อมูลยา ${code} เรียบร้อยแล้ว!` });
      setShowModal(false);
      fetchInventory();
    } else {
      setStatus({ type: 'error', message: res.error || 'ไม่สามารถบันทึกข้อมูลยาได้' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">การจัดการคลังยา (Inventory Management)</h1>
              <p className="text-slate-500 text-sm">ตรวจสอบปริมาณสต๊อกยา เติมเวชภัณฑ์ และตั้งค่าจุดแจ้งเตือนสั่งซื้อ (Reorder Level)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition shadow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> เพิ่มรายการยา / เพิ่มสต๊อก
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
                <th className="px-4 py-3">รหัสยา</th>
                <th className="px-4 py-3">ชื่อยา / ยาสามัญ</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3 text-center">คงเหลือในสต๊อก</th>
                <th className="px-4 py-3 text-center">จุดสั่งซื้อ (Reorder)</th>
                <th className="px-4 py-3 text-right">ราคา/หน่วย</th>
                <th className="px-4 py-3 text-center">สถานะสต๊อก</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" /> กำลังโหลดข้อมูลคลังยา...
                  </td>
                </tr>
              ) : (
                medications.map((med) => {
                  const isLowStock = med.stockQuantity <= med.reorderLevel;
                  return (
                    <tr key={med.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">{med.code}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <p className="text-xs text-slate-400">{med.genericName}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-600">{med.category}</td>
                      <td className="px-4 py-3 text-center font-bold text-slate-900">
                        {med.stockQuantity.toLocaleString()} {med.unit}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-slate-500">
                        {med.reorderLevel.toLocaleString()} {med.unit}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatTHB(med.pricePerUnit)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> ยาสต๊อกต่ำ
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            ปกติ ({med.stockQuantity})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Restock Medication */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900 border-b pb-3">เพิ่มยาใหม่ / ปรับสต๊อกยา</h3>
            <form onSubmit={handleSaveMedication} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">รหัสยา *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่ *</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อการค้า (Brand Name) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ยาสามัญ (Generic Name) *</label>
                <input
                  type="text"
                  required
                  value={genericName}
                  onChange={(e) => setGenericName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">หน่วย *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ราคา/หน่วย (฿) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">จำนวนบวกเพิ่ม *</label>
                  <input
                    type="number"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">จุดเตือนสั่งซื้อเพิ่ม (Reorder Level)</label>
                <input
                  type="number"
                  required
                  value={reorderLevel}
                  onChange={(e) => setReorderLevel(e.target.value)}
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
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm shadow"
                >
                  บันทึกเข้าคลัง
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
