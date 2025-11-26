'use client';

import React, { useState } from 'react';
import { BarChart3, Mail, Settings, ShoppingCart, TrendingUp } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  { id: 'carts', label: 'Carrinhos', icon: ShoppingCart },
  { id: 'history', label: 'Histórico', icon: Mail },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

interface RecoveryTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
}

export function RecoveryTabs({ children, defaultTab = 'overview' }: RecoveryTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.props.id === activeTab) {
            return child;
          }
          return null;
        })}
      </div>
    </div>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
}

export function TabPanel({ children }: TabPanelProps) {
  return <div>{children}</div>;
}
