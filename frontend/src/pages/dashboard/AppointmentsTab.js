import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schedulingService } from '../../services/api';

export default function AppointmentsTab() {
  const { tenantId } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Form states for manual booking
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    serviceName: 'Consulta Geral',
    startTime: '',
    notes: '',
  });

  const loadSlots = useCallback(async (date) => {
    if (!tenantId) return;
    setLoadingSlots(true);
    try {
      const data = await schedulingService.getSlots(tenantId, date);
      setSlots(data.slots || []);
    } catch (err) {
      console.warn('Erro ao buscar slots:', err);
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [tenantId]);

  const loadAppointments = useCallback(async (phone = '') => {
    if (!tenantId) return;
    setLoadingAppts(true);
    try {
      const data = await schedulingService.listAppointments(tenantId, phone);
      setAppointments(data.appointments || []);
    } catch (err) {
      console.warn('Erro ao listar agendamentos:', err);
      setAppointments([]);
    } finally {
      setLoadingAppts(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadSlots(selectedDate);
    loadAppointments();
  }, [selectedDate, loadSlots, loadAppointments]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    loadSlots(newDate);
  };

  const handleCancelAppointment = async (appt) => {
    if (!window.confirm(`Tem certeza que deseja cancelar a consulta de ${appt.clientName}?`)) {
      return;
    }

    try {
      const target = appt.googleEventId || appt.clientPhone;
      await schedulingService.cancelAppointment(tenantId, target);
      setFeedback({ type: 'success', text: `Consulta de ${appt.clientName} cancelada com sucesso!` });
      loadAppointments(searchPhone);
      loadSlots(selectedDate);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: `Erro ao cancelar consulta: ${err.response?.data?.message || err.message}`,
      });
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate start and end ISO
      const startIso = new Date(formData.startTime).toISOString();
      const endIso = new Date(new Date(formData.startTime).getTime() + 30 * 60000).toISOString();

      await schedulingService.bookAppointment(tenantId, {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        serviceName: formData.serviceName,
        startTime: startIso,
        endTime: endIso,
        notes: formData.notes,
      });

      setFeedback({ type: 'success', text: 'Consulta agendada com sucesso no Google Agenda!' });
      setModalOpen(false);
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        serviceName: 'Consulta Geral',
        startTime: '',
        notes: '',
      });
      loadAppointments(searchPhone);
      loadSlots(selectedDate);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: `Erro ao agendar: ${err.response?.data?.message || err.message}`,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Feedback Alert */}
      {feedback.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{feedback.text}</span>
          <button
            onClick={() => setFeedback({ type: '', text: '' })}
            className="text-xs font-bold px-2 hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Google Agenda & Agendamentos</h2>
          <p className="text-sm text-slate-400 mt-1">
            Consulte horários vagos em tempo real ou cadastre uma nova consulta.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md transition-all flex items-center gap-2"
        >
          <span>+</span>
          <span>Novo Agendamento Manual</span>
        </button>
      </div>

      {/* Available Slots Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">Vagas Disponíveis na Agenda Google</h3>
            <p className="text-xs text-slate-400">
              Slots livres calculados descontando eventos já existentes no calendário.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="slot-date-picker" className="text-xs text-slate-400 font-medium">Data:</label>
            <input
              id="slot-date-picker"
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loadingSlots ? (
          <div className="py-6 text-center text-xs text-slate-400">Consultando Google Calendar API...</div>
        ) : slots.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl">
            Nenhum horário livre encontrado para esta data ou fora do expediente.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {slots.map((slot, idx) => {
              const timeStr = new Date(slot).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-mono font-medium hover:bg-emerald-500/20 transition-colors cursor-default"
                >
                  🕒 {timeStr}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Registered Appointments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-bold text-white">Consultas Marcadas ({appointments.length})</h3>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filtrar por telefone..."
              value={searchPhone}
              onChange={(e) => {
                setSearchPhone(e.target.value);
                loadAppointments(e.target.value);
              }}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
            />
          </div>
        </div>

        {loadingAppts ? (
          <div className="py-8 text-center text-xs text-slate-400">Carregando agendamentos...</div>
        ) : appointments.length === 0 ? (
          <div className="py-8 text-center bg-slate-950/40 rounded-xl text-xs text-slate-500">
            Nenhum agendamento encontrado no banco de dados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Telefone</th>
                  <th className="pb-3 font-semibold">Serviço</th>
                  <th className="pb-3 font-semibold">Data / Horário</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {appointments.map((appt) => (
                  <tr key={appt.id} className="text-slate-300 hover:bg-slate-800/30">
                    <td className="py-3.5 font-medium text-white">{appt.clientName}</td>
                    <td className="py-3.5 text-xs font-mono text-slate-400">{appt.clientPhone}</td>
                    <td className="py-3.5 text-xs text-slate-300">{appt.summary || 'Consulta'}</td>
                    <td className="py-3.5 text-xs font-mono text-indigo-300">
                      {new Date(appt.startTime).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                          appt.status === 'scheduled'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {appt.status === 'scheduled' && (
                        <button
                          onClick={() => handleCancelAppointment(appt)}
                          className="px-2.5 py-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Manual Appointment */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Novo Agendamento Manual</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nome do Cliente:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João Silva"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Telefone WhatsApp:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 5511988887777"
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Email (Opcional):</label>
                <input
                  type="email"
                  placeholder="cliente@email.com"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Serviço / Especialidade:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Consulta Médica / Corte / Avaliação"
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Data e Hora de Início:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Confirmar e Sincronizar Google
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
