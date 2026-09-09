import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    password: '',
    calendarId: 'primary',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        businessName: formData.businessName || formData.name,
        email: formData.email,
        password: formData.password,
        calendarId: formData.calendarId || 'primary',
      });
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Erro ao criar conta. Verifique os dados e tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Criar Conta no zendaBot | Cadastro</title>
        <meta name="description" content="Cadastre sua clínica, consultório ou empresa no zendaBot" />
      </Helmet>

      <main className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 font-sans relative overflow-hidden py-12">
        {/* Background glow effects */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none"></div>

        {/* Back Link */}
        <Link
          to="/"
          className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Voltar para a página inicial</span>
        </Link>

        {/* Register Card */}
        <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 mx-auto mb-3">
              <span className="text-2xl font-black text-white">Z</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Criar Conta no zendaBot</h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure seu Tenant multi-empresa com agendamento via WhatsApp e Google Calendar
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-name">
                  Seu Nome Completo *
                </label>
                <input
                  id="reg-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Dr. Roberto"
                  className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-biz">
                  Nome do Estabelecimento *
                </label>
                <input
                  id="reg-biz"
                  name="businessName"
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Ex: Clínica Bem Estar"
                  className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-email">
                E-mail Corporativo *
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="contato@clinicabemestar.com.br"
                className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-pass">
                Senha de Acesso (mínimo 6 caracteres) *
              </label>
              <input
                id="reg-pass"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1" htmlFor="reg-cal">
                Google Calendar ID
              </label>
              <input
                id="reg-cal"
                name="calendarId"
                type="text"
                value={formData.calendarId}
                onChange={handleChange}
                placeholder="primary ou seu.calendario@gmail.com"
                className="w-full bg-slate-800/80 border border-slate-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-500 font-mono text-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Deixe <code className="text-indigo-400">primary</code> se ainda não possuir o ID da sua agenda. Você pode alterar depois nas configurações.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Cadastrando empresa...' : 'Criar Minha Conta no zendaBot'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
            Já possui uma conta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
              Faça login
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
