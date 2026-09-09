import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function About() {
  return (
    <>
      <Helmet>
        <title>Sobre a Arquitetura | zendaBot</title>
        <meta
          name="description"
          content="Conheça a arquitetura limpa (Clean Architecture), integrações e tecnologia do zendaBot."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Clean Architecture & Multi-Tenant
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Engenharia de Software de Alto Nível
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              O zendaBot foi projetado seguindo rigorosamente os padrões da Arquitetura Limpa (Clean Architecture),
              garantindo que as regras de agendamento independam de frameworks ou bibliotecas externas.
            </p>
          </div>

          {/* Architecture Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                🏛️
              </div>
              <h3 className="text-lg font-bold text-white">Clean Architecture Desacoplada</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Camadas bem delimitadas: <strong>Domain</strong> (entidades puras e interfaces), <strong>Application</strong> (casos de uso de agendamento e autenticação), <strong>Infrastructure</strong> (adaptadores de banco, Google e Baileys) e <strong>Presentation</strong> (controladores HTTP).
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-lg">
                🧠
              </div>
              <h3 className="text-lg font-bold text-white">Multi-LLM com Function Calling</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suporte nativo a <strong>Google Gemini</strong>, <strong>Groq (Llama 3.3)</strong>, <strong>OpenAI GPT-4o</strong> e <strong>Claude 3.5</strong>. O modelo executa chamadas de função seguras para consultar slots e persistir consultas.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg">
                📅
              </div>
              <h3 className="text-lg font-bold text-white">Google Calendar API v3</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integração direta com o Google Calendar. Cálculo matemático de horários disponíveis considerando horário comercial, duração dos slots e bloqueio de intervalos com eventos já existentes.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg">
                📱
              </div>
              <h3 className="text-lg font-bold text-white">WhatsApp Baileys Multi-Tenant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada empresa possui sua própria sessão de socket segregada em disco (<code className="text-indigo-300 font-mono">auth/tenant_id/</code>), garantindo privacidade e isolamento total entre diferentes clientes.
              </p>
            </div>
          </div>

          {/* Fallback Section */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-700/30 rounded-2xl p-8 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🛡️</span> Resiliência com Fallback Heurístico
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sabemos que APIs de LLM externas podem sofrer instabilidades temporárias ou atingir limites de taxa (Rate Limits). Por isso, o zendaBot possui um manipulador de intenções de contingência (<strong>FallbackIntentHandler</strong>) que detecta datas e pedidos de consulta por regex heurístico e aciona o Google Calendar diretamente, garantindo 100% de disponibilidade.
            </p>
          </div>

          <div className="text-center pt-8">
            <Link
              to="/register"
              className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-xl transition-all hover:scale-105"
            >
              Criar Minha Conta Agora →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
