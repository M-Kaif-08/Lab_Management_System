import React, { useState, useEffect } from 'react';
import {
  Search,
  ShoppingCart,
  X,
  FlaskConical,
  Layers,
  Ban,
  CheckCircle2,
  AlertCircle,
  Eye
} from 'lucide-react';
import { apiRequest } from '../../lib/api.js';
import { Order, Patient, TestCatalogItem, Panel, CreateOrder } from '@lab/contracts';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Book Order Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [catalogTests, setCatalogTests] = useState<TestCatalogItem[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>([]);
  const [referringDoctor, setReferringDoctor] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [booking, setBooking] = useState(false);

  // Cancel Order Modal State
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await apiRequest<{ items: Order[]; total: number }>(`/orders?query=${encodeURIComponent(searchQuery)}`);
      setOrders(res.items);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery]);

  const openBookModal = async () => {
    try {
      const [patientsRes, testsRes, panelsRes] = await Promise.all([
        apiRequest<{ items: Patient[] }>('/patients?limit=50').catch(() => ({ items: [] })),
        apiRequest<{ items: TestCatalogItem[] }>('/catalog/tests?limit=50').catch(() => ({ items: [] })),
        apiRequest<Panel[]>('/catalog/panels').catch(() => [])
      ]);
      setPatients(patientsRes.items || []);
      setCatalogTests(testsRes.items || []);
      setPanels(panelsRes || []);
      if (patientsRes.items && patientsRes.items.length > 0) {
        setSelectedPatientId(patientsRes.items[0].id);
      }
      setIsBookModalOpen(true);
    } catch (err: any) {
      alert('Failed to load patient and catalog lists: ' + err.message);
    }
  };

  const handleToggleTest = (id: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleTogglePanel = (id: string) => {
    setSelectedPanelIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const calculateTotalPrice = () => {
    let sum = 0;
    for (const tid of selectedTestIds) {
      const t = catalogTests.find((x) => x.id === tid);
      if (t) sum += Number(t.price);
    }
    for (const pid of selectedPanelIds) {
      const p = panels.find((x) => x.id === pid);
      if (p) sum += Number(p.price || 0);
    }
    return sum;
  };

  const handleBookOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('Please select a patient');
      return;
    }
    if (selectedTestIds.length === 0 && selectedPanelIds.length === 0) {
      alert('Please select at least one test or diagnostic panel');
      return;
    }

    try {
      setBooking(true);
      const payload: CreateOrder = {
        patientId: selectedPatientId,
        testIds: selectedTestIds,
        panelIds: selectedPanelIds,
        referringDoctor: referringDoctor || null,
        clinicalNotes: clinicalNotes || null
      };

      await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setIsBookModalOpen(false);
      setSelectedTestIds([]);
      setSelectedPanelIds([]);
      setReferringDoctor('');
      setClinicalNotes('');
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Error booking order');
    } finally {
      setBooking(false);
    }
  };

  const handleViewOrder = async (orderId: string) => {
    try {
      const fullOrder = await apiRequest<any>(`/orders/${orderId}`);
      setSelectedOrder(fullOrder);
    } catch (err: any) {
      alert('Failed to load order details: ' + err.message);
    }
  };

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderToCancel || !cancelReason.trim()) return;

    try {
      setCancelling(true);
      await apiRequest(`/orders/${orderToCancel.id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason })
      });
      setOrderToCancel(null);
      setCancelReason('');
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        setSelectedOrder(null);
      }
      fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Error cancelling order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_sample':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3 h-3" /> Pending Sample
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <FlaskConical className="w-3 h-3" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <Ban className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Orders & Requisitions</h2>
          <p className="text-sm text-slate-500">Atomic order booking, frozen price snapshots, and accessioning queues</p>
        </div>
        <button
          onClick={openBookModal}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Book New Order</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order # or Referring Doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order Number</th>
                <th className="py-3 px-4">Patient Name & MRN</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No orders booked yet. Click "Book New Order" to create one.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{order.patientName}</div>
                      <div className="text-xs font-mono text-slate-400">{order.patientMrn}</div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(order.status)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      PKR {Number(order.totalAmount).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      {order.status !== 'cancelled' && (
                        <button
                          onClick={() => setOrderToCancel(order)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel</span>
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

      {/* Book Order Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-800">Book Patient Order</h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookOrder} className="space-y-5 pt-4">
              {/* Patient Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Registered Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  required
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} ({p.mrn}) — {p.gender}, {p.ageYears ? `${p.ageYears} yrs` : 'Age N/A'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Panels Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  <span>Diagnostic Panels (Profiles)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {panels.map((p) => {
                    const isChecked = selectedPanelIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePanel(p.id)}
                        className={`p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition ${
                          isChecked ? 'bg-amber-50/80 border-amber-300 text-amber-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-[10px] px-1 py-0.5 bg-white rounded border border-slate-200 mr-1.5">{p.code}</span>
                          <span>{p.name}</span>
                        </div>
                        <span className="font-semibold text-amber-800">PKR {Number(p.price || 0)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tests Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                  <span>Individual Tests</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                  {catalogTests.map((t) => {
                    const isChecked = selectedTestIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTest(t.id)}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition ${
                          isChecked ? 'bg-teal-50 border-teal-300 text-teal-900 font-medium' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-mono text-[10px] px-1 py-0.5 bg-slate-100 rounded mr-1.5">{t.code}</span>
                          <span>{t.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">PKR {Number(t.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Referring Doctor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Ahmed Khan"
                    value={referringDoctor}
                    onChange={(e) => setReferringDoctor(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Fasting 10 hours, routine checkup"
                    value={clinicalNotes}
                    onChange={(e) => setClinicalNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Order Total Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Calculated Order Total:</span>
                <span className="text-xl font-bold text-teal-700 font-mono">
                  PKR {calculateTotalPrice().toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {booking ? 'Booking...' : 'Confirm Order & Allocate Barcodes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs px-2 py-0.5 bg-teal-50 text-teal-800 rounded font-bold border border-teal-200">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="font-bold text-slate-800 text-lg mt-1">Order Specification</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Frozen Patient Snapshot */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Patient Snapshot</span>
                <span className="font-bold text-slate-800 text-sm">{selectedOrder.patientSnapshot?.fullName || selectedOrder.patientName}</span>
                <span className="text-slate-500 block font-mono text-[11px]">{selectedOrder.patientSnapshot?.patientNumber || selectedOrder.patientMrn}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Demographics & Phone</span>
                <span className="text-slate-700">{selectedOrder.patientSnapshot?.gender}, {selectedOrder.patientSnapshot?.age || 'N/A'}</span>
                <span className="text-slate-500 block">{selectedOrder.patientSnapshot?.phone || selectedOrder.patientPhone}</span>
              </div>
            </div>

            {/* Booked Items with Frozen Snapshot */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Booked Test Items & Parameters</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{item.testName} ({item.testCode})</span>
                      <span className="font-mono text-teal-700">PKR {Number(item.priceAtOrder).toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex gap-3">
                      <span>Tube: <strong>{item.sampleType}</strong></span>
                      <span>Status: <strong>{item.status}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Samples Accessioned */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Allocated Samples</h4>
              <div className="space-y-1.5">
                {selectedOrder.samples?.map((s: any) => (
                  <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 px-2 py-0.5 bg-white border border-slate-200 rounded">
                        {s.barcode}
                      </span>
                      <span className="text-slate-600">{s.sampleType}</span>
                    </div>
                    <span className="capitalize px-2 py-0.5 bg-teal-50 text-teal-800 rounded font-medium text-[11px]">
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {orderToCancel && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-rose-700 flex items-center gap-2">
                <Ban className="w-5 h-5" />
                <span>Cancel Order</span>
              </h3>
              <button
                onClick={() => setOrderToCancel(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4 pt-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Cancelling order <strong className="font-mono text-slate-800">{orderToCancel.orderNumber}</strong> will atomically cancel all pending order items and associated samples while retaining audit history.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Cancellation</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Patient requested cancellation before blood draw"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderToCancel(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  Keep Order
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
