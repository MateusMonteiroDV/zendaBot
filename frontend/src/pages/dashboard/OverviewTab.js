import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { whatsappService, schedulingService } from '../../services/api';

export default function OverviewTab({ setActiveTab }) {
  const { user, tenantId } = useAuth();
  const [waStatus, setWaStatus] = useState({ status: 'checking' });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      if (!tenantId) return;
      try {
        const [wa, appts] = await Promise.allSettled([
          whatsappService.getStatus(tenantId),
          schedulingService.listAppointments(tenantId),
        ]);

        if (isMounted) {
          if (wa.status === 'fulfilled') setWaStatus(wa.value);
          if (appts.status === 'fulfilled') setAppointments(appts.value?.appointments || []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do overview:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [tenantId]);

  const isWaConnected = waStatus.status === 'connected';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 p-6 sm:p-8 border border-indigo-700/30">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-400/20 mb-3">
            Assistente Virtual Ativo
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Olá, {user?.name || 'Gestor'}! 👋
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
            Bem-vindo ao centro de operações do <strong className="text-white">zendaBot</strong>.
            Seu robô atende clientes 24/7 no WhatsApp, consulta vagas em tempo real e sincroniza com o Google Agenda.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <span>{isWaConnected ? 'Ver Conexão WhatsApp' : 'Conectar WhatsApp Agora'}</span>
              <span>→</span>
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium border border-slate-700 transition-colors"
            >
              Testar Chat com IA
            </button>
          </div>
        </div>

        {/* Ambient glow decoration */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* WhatsApp Status Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">WhatsApp Baileys</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isWaConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400'
              }`}
            ></span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-white capitalize">
              {isWaConnected ? 'Conectado' : waStatus.status === 'qr_ready' ? 'Aguardando QR' : 'Desconectado'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isWaConnected ? 'Pronto para receber mensagens' : 'Escaneie o QR Code no painel'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className="mt-4 text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Gerenciar Conexão →
          </button>
        </div>

        {/* Appointments Count Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Consultas Marcadas</span>
            <span className="p-1.5 bg-purple-500/10 text-purple-400 rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-white">{appointments.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Total de registros no sistema</p>
          </div>
          <button
            onClick={() => setActiveTab('appointments')}
            className="mt-4 text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Ver Agendamentos →
          </button>
        </div>

        {/* Google Calendar Sync Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Google Calendar</span>
            <span className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-white">Sincronizado</h3>
            <p className="text-xs text-slate-400 mt-1">Slots e eventos em tempo real</p>
          </div>
          <button
            onClick={() => setActiveTab('settings')}
            className="mt-4 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Configurar Calendário →
          </button>
        </div>

        {/* AI Provider Engine Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Motor de IA</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-xl font-bold text-white">Multi-LLM</h3>
            <p className="text-xs text-slate-400 mt-1">Gemini / Groq + Fallback Ativo</p>
          </div>
          <button
            onClick={() => setActiveTab('simulator')}
            className="mt-4 text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Abrir Chat de Teste →
          </button>
        </div>
      </div>

      {/* Recent Appointments & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent appointments table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Últimos Agendamentos</h3>
            <button
              onClick={() => setActiveTab('appointments')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Ver todos ({appointments.length})
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-sm">Carregando consultas...</div>
          ) : appointments.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/50 rounded-lg border border-slate-800/80">
              <p className="text-sm text-slate-400">Nenhum agendamento registrado ainda.</p>
              <p className="text-xs text-slate-500 mt-1">
                Conecte seu WhatsApp ou crie um agendamento de teste!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-800">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Telefone</th>
                    <th className="pb-3 font-semibold">Início</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {appointments.slice(0, 5).map((appt) => (
                    <tr key={appt.id} className="text-slate-200">
                      <td className="py-3 font-medium text-white">{appt.clientName}</td>
                      <td className="py-3 text-slate-400 font-mono text-xs">{appt.clientPhone}</td>
                      <td className="py-3 text-xs">{new Date(appt.startTime).toLocaleString('pt-BR')}</td>
                      <td className="py-3">
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Quick Guide / Architecture specs */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-base font-bold text-white">Como Funciona o Fluxo</h3>
          
          <div className="space-y-3 text-xs text-slate-300">
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold">
                1
              </span>
              <p>O cliente manda mensagem no WhatsApp perguntando sobre horários ou querendo agendar.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold">
                2
              </span>
              <p>A IA analisa o contexto, faz Function Calling e consulta slots vagos no Google Calendar.</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold">
                3
              </span>
              <p>O evento é criado na agenda e persistido no PostgreSQL simultaneamente com confirmação instantânea.</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs">
              <p className="font-semibold text-slate-200">Precisa de suporte ou customização?</p>
              <p className="text-slate-400 mt-1">
                Acesse o menu de Configurações para definir seus horários de expediente e fuso horário.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
