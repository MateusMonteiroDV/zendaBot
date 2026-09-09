import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { whatsappService } from '../../services/api';

export default function SimulatorTab() {
  const { tenantId, user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `Olá! Sou o assistente virtual da ${user?.name || 'empresa'}. Como posso te ajudar hoje com seus agendamentos?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    'Quais horários tem livres amanhã?',
    'Gostaria de agendar amanhã às 10:00 para Consulta',
    'Preciso verificar meus agendamentos marcados',
    'Quero cancelar minha consulta',
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading || !tenantId) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await whatsappService.sendWebhookMessage(
        tenantId,
        userMsg.text,
        'Cliente Teste',
        '5511999998888'
      );

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply || 'Mensagem processada sem resposta explícita.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `⚠️ Erro ao processar mensagem com IA: ${err.response?.data?.message || err.message}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <h2 className="text-xl font-bold text-white">Simulador do Robô WhatsApp com IA</h2>
        <p className="text-xs text-slate-400 mt-1">
          Teste a inteligência artificial, Function Calling e integração com o Google Calendar diretamente aqui sem precisar do celular.
        </p>
      </div>

      {/* WhatsApp Mockup Interface */}
      <div className="bg-[#0b141a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[600px]">
        {/* WhatsApp Header */}
        <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow">
              🤖
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                {user?.name || 'zendaBot'} • Atendimento IA
              </h3>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                Online (Google Calendar integrado)
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setMessages([
                {
                  id: 1,
                  sender: 'bot',
                  text: `Histórico reiniciado. Como posso te ajudar?`,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60"
          >
            Limpar Conversa
          </button>
        </div>

        {/* Chat message bubbles */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-md leading-relaxed ${
                    isUser
                      ? 'bg-[#005c4b] text-white rounded-tr-none'
                      : msg.isError
                      ? 'bg-rose-900/60 border border-rose-700 text-rose-200 rounded-tl-none'
                      : 'bg-[#202c33] text-slate-100 rounded-tl-none border border-slate-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${
                      isUser ? 'text-emerald-200/70' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.time}</span>
                    {isUser && <span className="text-emerald-300">✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#202c33] rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-300 flex items-center gap-2 border border-slate-700/50">
                <div className="flex space-x-1">
                  <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
                <span className="text-[11px] text-slate-400">Consultando Google Calendar & IA...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompt chips */}
        <div className="bg-[#202c33]/70 px-4 py-2 flex flex-wrap gap-2 border-t border-slate-800">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              disabled={loading}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-700 transition-colors disabled:opacity-50"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="bg-[#202c33] p-3 flex items-center gap-2 border-t border-slate-800"
        >
          <input
            type="text"
            placeholder="Digite uma mensagem como se fosse o cliente no WhatsApp..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#2a3942] text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none placeholder-slate-400 border border-transparent focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs font-semibold shadow disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <span>Enviar</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
