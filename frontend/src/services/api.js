import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para injetar token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zendabot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para capturar erros 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('zendabot_token');
        localStorage.removeItem('zendabot_user');
      }
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async ({ name, email, password, businessName, calendarId }) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      businessName,
      calendarId,
    });
    return res.data;
  },
};

// Serviços do WhatsApp / Baileys
export const whatsappService = {
  getStatus: async (tenantId) => {
    const res = await api.get(`/whatsapp/${tenantId}/status`);
    return res.data;
  },
  startSession: async (tenantId) => {
    const res = await api.post(`/whatsapp/${tenantId}/connect`);
    return res.data;
  },
  disconnectSession: async (tenantId) => {
    const res = await api.post(`/whatsapp/${tenantId}/disconnect`);
    return res.data;
  },
  sendWebhookMessage: async (tenantId, text, senderName = 'Cliente Teste', phone = '5511999998888') => {
    const res = await api.post(`/whatsapp/${tenantId}/webhook`, {
      key: {
        remoteJid: `${phone}@s.whatsapp.net`,
        fromMe: false,
      },
      pushName: senderName,
      message: {
        conversation: text,
      },
    });
    return res.data;
  },
};

// Serviços de Agendamento e Google Agenda
export const schedulingService = {
  getSlots: async (tenantId, date) => {
    const res = await api.get(`/scheduling/${tenantId}/slots`, {
      params: { date },
    });
    return res.data;
  },
  bookAppointment: async (tenantId, appointmentData) => {
    const res = await api.post(`/scheduling/${tenantId}/book`, appointmentData);
    return res.data;
  },
  cancelAppointment: async (tenantId, eventIdOrPhone) => {
    const res = await api.post(`/scheduling/${tenantId}/cancel`, {
      eventId: eventIdOrPhone,
      clientPhone: eventIdOrPhone,
    });
    return res.data;
  },
  listAppointments: async (tenantId, phone = '') => {
    const res = await api.get(`/scheduling/${tenantId}/appointments`, {
      params: { phone },
    });
    return res.data;
  },
  getConfig: async (tenantId) => {
    const res = await api.get(`/scheduling/${tenantId}/config`);
    return res.data;
  },
  updateConfig: async (tenantId, config) => {
    const res = await api.put(`/scheduling/${tenantId}/config`, config);
    return res.data;
  },
};

export default api;
