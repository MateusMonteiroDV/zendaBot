import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/api';

export default function WhatsAppTab() {
  const { tenantId } = useAuth();
  const [status, setStatus] = useState({
    status: 'disconnected',
    qrCode: null,
    qrImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const pollTimerRef = useRef(null);

  const fetchStatus = useCallback(async () => {
    if (!tenantId) return;
    try {
      const data = await whatsappService.getStatus(tenantId);
      setStatus(data);
    } catch (err) {
      console.warn('Erro ao checar status do WhatsApp:', err.message);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStatus();

    // Polling inteligente: se estiver conectando ou com QR pronto, atualiza frequentemente
    pollTimerRef.current = setInterval(() => {
      fetchStatus();
    }, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchStatus]);

  const handleStartSession = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      await whatsappService.startSession(tenantId);
      setActionMessage('Sessão iniciada! Aguardando geração do QR Code...');
      await fetchStatus();
    } catch (err) {
      setActionMessage(`Erro ao iniciar sessão: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      await whatsappService.disconnectSession(tenantId);
      setActionMessage('Sessão desconectada com sucesso.');
      await fetchStatus();
    } catch (err) {
      setActionMessage(`Erro ao desconectar: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isConnected = status.status === 'connected';
  const isQrReady = status.status === 'qr_ready';
  const isConnecting = status.status === 'connecting';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              WhatsApp Multi-Tenant
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">Conexão do WhatsApp Bot</h2>
            <p className="text-sm text-slate-400 mt-1">
              Conecte o número de atendimento da sua empresa via Baileys para habilitar a IA.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="px-4 py-2 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/40 rounded-xl text-sm font-semibold transition-all"
              >
                {loading ? 'Desconectando...' : 'Desconectar Sessão'}
              </button>
            ) : (
              <button
                onClick={handleStartSession}
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Iniciando...' : 'Gerar Novo QR Code'}
              </button>
            )}
          </div>
        </div>

        {actionMessage && (
          <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-700/50 rounded-lg text-xs text-indigo-300">
            {actionMessage}
          </div>
        )}
      </div>

      {/* Main Connection Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: QR Code / Status Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] text-center">
          {isConnected ? (
            <div className="space-y-4 py-6">
              <div className="h-20 w-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">WhatsApp Conectado!</h3>
              <p className="text-xs text-slate-300 max-w-xs">
                Seu número está ativo e pronto. Mensagens recebidas serão processadas automaticamente pela inteligência artificial.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Sessão Online & Autenticada
              </div>
            </div>
          ) : isQrReady && status.qrImage ? (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-white rounded-xl shadow-xl inline-block">
                <img
                  src={status.qrImage}
                  alt="QR Code WhatsApp"
                  className="w-56 h-56 object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Escaneie o código com seu WhatsApp</h3>
                <p className="text-xs text-slate-400 mt-1">
                  O código atualiza automaticamente. Mantenha esta tela aberta.
                </p>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="space-y-4 py-8">
              <div className="h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-base font-bold text-white">Estabelecendo Sessão...</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Inicializando o socket Baileys para o seu Tenant. O QR Code aparecerá em instantes.
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-8">
              <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">WhatsApp Desconectado</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Clique no botão acima para iniciar a sessão e gerar seu QR Code de autenticação.
                </p>
              </div>
              <button
                onClick={handleStartSession}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all"
              >
                Conectar Agora
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Step by step instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4">Instruções para Conexão</h3>
            
            <ol className="space-y-4 text-xs text-slate-300">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center font-bold">
                  1
                </span>
                <div>
                  <strong className="text-white">Abra o WhatsApp no seu celular:</strong>
                  <p className="text-slate-400 mt-0.5">
                    Utilize o número institucional ou empresarial do seu estabelecimento.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center font-bold">
                  2
                </span>
                <div>
                  <strong className="text-white">Acesse o Menu de Aparelhos Conectados:</strong>
                  <p className="text-slate-400 mt-0.5">
                    No <strong>Android</strong>: toque nos três pontinhos (⋮) no topo &gt; Aparelhos conectados.
                    <br />
                    No <strong>iPhone (iOS)</strong>: Configurações &gt; Aparelhos conectados.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center font-bold">
                  3
                </span>
                <div>
                  <strong className="text-white">Toque em 'Conectar um aparelho':</strong>
                  <p className="text-slate-400 mt-0.5">
                    Aponte a câmera do seu telefone para o QR Code exibido ao lado.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <strong className="text-white">Pronto! Conexão Automatizada:</strong>
                  <p className="text-slate-400 mt-0.5">
                    A sessão permanecerá salva em disco em pasta isolada para o seu tenant (<code className="text-indigo-300 font-mono">auth/tenant_{tenantId?.slice(0, 6)}</code>).
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
            <strong>Dica de Segurança:</strong> O zendaBot não armazena mensagens pessoais no banco de dados, apenas as mensagens de consulta e confirmações de agendamento.
          </div>
        </div>
      </div>
    </div>
  );
}
