import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Helmet>
        <title>zendaBot | Agendamento via WhatsApp com IA & Google Calendar</title>
        <meta
          name="description"
          content="Automatize seu atendimento e agendamento de consultas pelo WhatsApp com Inteligência Artificial conectada em tempo real ao Google Calendar."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />

        {/* Hero Section */}
        <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
          
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-300">
                Llama 3.3 & Gemini 2.5 • Google Calendar API v3 • Baileys
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Agendamento Inteligente no{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                WhatsApp
              </span>{' '}
              conectado ao seu{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Google Agenda
              </span>
            </h1>

            <p className="max-w-3xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
              O <strong className="text-white">zendaBot</strong> conversa com seus clientes 24 horas por dia,
              identifica intenções com IA generativa, consulta slots vagos e grava consultas
              diretamente na sua agenda oficial sem sobreposição.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
                >
                  Abrir Meu Painel de Controle →
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
                  >
                    Começar Gratuitamente
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-all"
                  >
                    Já tenho conta (Login)
                  </Link>
                </>
              )}
            </div>

            {/* Micro badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Multi-Tenant por Estabelecimento
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Sem necessidade de app de terceiros
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Fallback Resiliente Anti-quedas
              </div>
            </div>
          </div>

          {/* Interactive Chat & Calendar Visual Demo */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
            <div className="h-10 bg-slate-800/60 border-b border-slate-700/60 px-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
              <span className="ml-2 text-xs font-mono text-slate-400">
                zendaBot Multi-Tenant Engine • Demonstração em Tempo Real
              </span>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: WhatsApp Flow preview */}
              <div className="bg-[#0b141a] rounded-xl p-4 border border-slate-800 space-y-3 font-sans text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                  <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                    Z
                  </div>
                  <div>
                    <p className="font-semibold text-white">Clínica Dr. Silva</p>
                    <p className="text-[10px] text-emerald-400">WhatsApp Oficial • zendaBot IA</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#005c4b] text-white px-3 py-2 rounded-xl rounded-tr-none max-w-[85%]">
                    Olá! Vocês têm horário livre para consulta amanhã à tarde?
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-[#202c33] text-slate-200 px-3 py-2 rounded-xl rounded-tl-none max-w-[85%] border border-slate-700/40">
                    Olá! Consultando o Google Agenda aqui... 📅 Temos horários disponíveis amanhã às <strong>14:00</strong>, <strong>15:30</strong> e <strong>17:00</strong>. Qual você prefere?
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-[#005c4b] text-white px-3 py-2 rounded-xl rounded-tr-none max-w-[85%]">
                    Pode ser às 14:00 por favor! Meu nome é Carolina.
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-[#202c33] text-slate-200 px-3 py-2 rounded-xl rounded-tl-none max-w-[85%] border border-slate-700/40">
                    ✅ <strong>Perfeito, Carolina!</strong> Sua consulta foi confirmada para amanhã às 14:00 e já está adicionada à agenda do Dr. Silva. Te aguardamos!
                  </div>
                </div>
              </div>

              {/* Right: Live Features callouts */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                    <span>⚡</span> Function Calling Instantâneo
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    A IA interpreta a fala humana e aciona diretamente funções de checagem e reserva de eventos no Google Calendar.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                    <span>🛡️</span> Zero Conflito de Horários
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    O algoritmo faz a checagem precisa de sobreposição temporal considerando a duração de cada consulta e o expediente configurado.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                  <h4 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                    <span>📱</span> Pareamento Fácil via QR Code
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Cada tenant inicia e conecta seu WhatsApp com o leitor de QR Code integrado no painel em menos de 1 minuto.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Steps Section */}
        <section className="py-20 bg-slate-900/50 border-t border-b border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Passo a Passo
              </span>
              <h2 className="text-3xl font-extrabold text-white">Como Funciona em 3 Etapas</h2>
              <p className="text-sm text-slate-400 max-w-xl mx-auto">
                Implementação rápida sem complicações técnicas para qualquer tipo de negócio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
                <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-base font-bold text-white">Crie sua Conta Tenant</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Defina o nome da sua empresa, horários de funcionamento e informe o seu ID do Google Calendar.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
                <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-base font-bold text-white">Escaneie o QR Code</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Conecte o número de WhatsApp no painel. O Baileys gerencia a sessão de forma segura e permanente.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
                <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-base font-bold text-white">Atendimento Automático</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Seus clientes agendam e cancelam sozinhos pelo WhatsApp enquanto você acompanha tudo no painel e na sua agenda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-xs text-slate-400">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                Z
              </div>
              <span className="font-bold text-slate-200 text-sm">zendaBot</span>
              <span className="text-slate-500">| Plataforma Multi-Tenant de Agendamento Inteligente</span>
            </div>

            <div className="flex items-center gap-6">
              <Link to="/pricing" className="hover:text-white transition-colors">Planos</Link>
              <Link to="/about" className="hover:text-white transition-colors">Arquitetura</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
              <Link to="/register" className="hover:text-white transition-colors">Cadastro</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
