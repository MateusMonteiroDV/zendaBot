import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import DashboardLayout from '../../components/DashboardLayout';
import OverviewTab from './OverviewTab';
import WhatsAppTab from './WhatsAppTab';
import AppointmentsTab from './AppointmentsTab';
import SimulatorTab from './SimulatorTab';
import SettingsTab from './SettingsTab';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <>
      <Helmet>
        <title>zendaBot | Painel de Controle</title>
        <meta name="description" content="Painel de gerenciamento do zendaBot" />
      </Helmet>

      <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'overview' && <OverviewTab setActiveTab={setActiveTab} />}
        {activeTab === 'whatsapp' && <WhatsAppTab />}
        {activeTab === 'appointments' && <AppointmentsTab />}
        {activeTab === 'simulator' && <SimulatorTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </DashboardLayout>
    </>
  );
}
