import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { InvoiceModal } from './components/InvoiceModal';

import { DashboardView } from './views/DashboardView';
import { NewOrderView } from './views/NewOrderView';
import { OrdersView } from './views/OrdersView';
import { CustomersView } from './views/CustomersView';
import { SuppliersView } from './views/SuppliersView';
import { NotesView } from './views/NotesView';
import { ProductsView } from './views/ProductsView';
import { CategoriesView } from './views/CategoriesView';
import { InventoryView } from './views/InventoryView';
import { ExpensesView } from './views/ExpensesView';
import { ExpenseCategoriesView } from './views/ExpenseCategoriesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';
import { AiAssistantView } from './views/AiAssistantView';
import { ProfileView } from './views/ProfileView';
import { UsersView } from './views/UsersView';

export function App() {
  const { isAuthenticated, activeTab, selectedInvoiceOrder, closeInvoiceModal } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <Header setMobileOpen={setMobileOpen} />

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        {/* Dynamic View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'new-order' && <NewOrderView />}
          {activeTab === 'orders' && <OrdersView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'suppliers' && <SuppliersView />}
          {activeTab === 'notes' && <NotesView />}
          {activeTab === 'products' && <ProductsView />}
          {activeTab === 'categories' && <CategoriesView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'expenses' && <ExpensesView />}
          {activeTab === 'expense-categories' && <ExpenseCategoriesView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'ai-assistant' && <AiAssistantView />}
          {activeTab === 'users' && <UsersView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>

      {/* Invoice Modal Popup for Print & Download */}
      <InvoiceModal order={selectedInvoiceOrder} onClose={closeInvoiceModal} />
    </div>
  );
}

export default App;
