import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Pricing() {
  const plans = [
    {
      name: 'Profissional Autônomo',
      price: 'R$ 79',
      period: '/mês',
      description: 'Ideal para médicos, psicólogos, advogados, consultores e terapeutas.',
      features: [
        '1 Conexão WhatsApp Dedicada (Baileys)',
        'Integração Google Calendar Oficial',
        'Até 500 agendamentos/mês com IA',
        'Detecção inteligente de slots e conflitos',
        'Painel de Controle e Simulador de Chat',
        'Suporte por email',
      ],
      popular: false,
      buttonText: 'Começar com Plano Autônomo',
      link: '/register',
    },
    {
      name: 'Clínica & Estabelecimento',
      price: 'R$ 169',
      period: '/mês',
      description: 'Perfeito para clínicas médicas, estéticas, consultórios múltiplos e salões.',
      features: [
        'Até 3 Conexões WhatsApp segredadas',
        'Google Calendar v3 com fusos horários flexíveis',
        'Agendamentos e conversas ilimitadas com IA',
        'Multi-LLM: Gemini 2.5 Flash + Llama 3.3',
        'Fallback heurístico anti-instabilidade',
        'Histórico e exportação PostgreSQL',
        'Suporte prioritário via WhatsApp',
      ],
      popular: true,
      buttonText: 'Assinar Plano Clínica',
      link: '/register',
    },
    {
      name: 'Enterprise / Redes',
      price: 'Sob Consulta',
      period: '',
      description: 'Para franquias, redes hospitalares e plataformas com alta demanda.',
      features: [
        'Conexões WhatsApp ilimitadas',
        'Múltiplas agendas compartilhadas Google Workspace',
        'Modelos de IA customizados e Fine-tuning',
        'Instalação On-Premise ou Docker Dedicated',
        'SLA de 99.9% de uptime garantido',
        'Gerente de conta dedicado',
      ],
      popular: false,
      buttonText: 'Falar com Consultor',
      link: '/register',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Planos & Preços | zendaBot</title>
        <meta
          name="description"
          content="Escolha o plano ideal do zendaBot para automatizar os agendamentos da sua empresa."
        />
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Investimento Transparente
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Planos pensados para escalar o seu negócio
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Economize horas da sua equipe e garanta que nenhum cliente fique sem resposta no WhatsApp.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 flex flex-col justify-between relative transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-600/20 scale-105'
                    : 'bg-slate-900/80 border border-slate-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    Mais Escolhido
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 min-h-[36px]">{plan.description}</p>

                  <div className="mt-6 flex items-baseline gap-1 pb-6 border-b border-slate-800">
                    <span className="text-3xl sm:text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">{plan.period}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-xs text-slate-300">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    to={plan.link}
                    className={`w-full block py-3 text-center rounded-xl text-xs font-bold transition-all shadow-md ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
