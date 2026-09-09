import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { schedulingService } from '../../services/api';

export default function SettingsTab() {
  const { tenantId, user } = useAuth();
  const [config, setConfig] = useState({
    calendarId: 'primary',
    timeZone: 'America/Sao_Paulo',
    businessHoursStart: '08:00',
    businessHoursEnd: '18:00',
    appointmentDurationMinutes: 30,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadConfig = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await schedulingService.getConfig(tenantId);
      if (data && Object.keys(data).length > 0) {
        setConfig((prev) => ({
          ...prev,
          ...data,
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await schedulingService.updateConfig(tenantId, {
        calendarId: config.calendarId,
        timeZone: config.timeZone,
        businessHoursStart: config.businessHoursStart,
        businessHoursEnd: config.businessHoursEnd,
        appointmentDurationMinutes: Number(config.appointmentDurationMinutes),
      });

      setMessage({
        type: 'success',
        text: 'Configurações do Google Agenda atualizadas com sucesso!',
      });
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Erro ao salvar configurações: ${err.response?.data?.message || err.message}`,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white">Configurações do Estabelecimento & Google Agenda</h2>
        <p className="text-sm text-slate-400 mt-1">
          Ajuste as credenciais do calendário, horários de expediente e tempo de cada consulta para seu Tenant.
        </p>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="text-xs font-bold px-2 hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">Carregando configurações atuais...</div>
        ) : (
          <>
            {/* Informações do Tenant */}
            <div className="space-y-4 pb-6 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400">
                Identificação do Estabelecimento
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nome Cadastrado:</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email de Contato:</label>
                  <input
                    type="text"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-slate-800/50 border border-slate-700/60 rounded-lg p-2.5 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Google Calendar Settings */}
            <div className="space-y-4 pb-6 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400">
                Sincronização com Google Agenda
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Google Calendar ID:
                  </label>
                  <input
                    type="text"
                    required
                    value={config.calendarId}
                    onChange={(e) => setConfig({ ...config, calendarId: e.target.value })}
                    placeholder="primary ou email@gmail.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Insira <code className="text-indigo-400">primary</code> para o calendário principal da conta Google ou o e-mail da agenda compartilhada.
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fuso Horário (Timezone):</label>
                  <select
                    value={config.timeZone}
                    onChange={(e) => setConfig({ ...config, timeZone: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="America/Sao_Paulo">América / São Paulo (GMT-3)</option>
                    <option value="America/Manaus">América / Manaus (GMT-4)</option>
                    <option value="America/Fortaleza">América / Fortaleza (GMT-3)</option>
                    <option value="America/Recife">América / Recife (GMT-3)</option>
                    <option value="America/Belem">América / Belém (GMT-3)</option>
                    <option value="America/Cuiaba">América / Cuiabá (GMT-4)</option>
                    <option value="America/Rio_Branco">América / Rio Branco (GMT-5)</option>
                    <option value="UTC">UTC (Universal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Business Hours Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-purple-400">
                Horários de Atendimento & Duração
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Início do Expediente:</label>
                  <input
                    type="time"
                    required
                    value={config.businessHoursStart}
                    onChange={(e) => setConfig({ ...config, businessHoursStart: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Término do Expediente:</label>
                  <input
                    type="time"
                    required
                    value={config.businessHoursEnd}
                    onChange={(e) => setConfig({ ...config, businessHoursEnd: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Duração do Slot (minutos):</label>
                  <select
                    value={config.appointmentDurationMinutes}
                    onChange={(e) =>
                      setConfig({ ...config, appointmentDurationMinutes: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos (Padrão)</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (1 hora)</option>
                    <option value={90}>90 minutos (1h 30m)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
