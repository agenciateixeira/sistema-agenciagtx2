'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const current = tabRefs.current[activeTab];
    current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="rounded-t-lg border-b border-gray-200 bg-white">
        <div className="-mx-4 px-4 sm:mx-0 sm:px-6">
          <nav
            className="flex snap-x snap-mandatory gap-3 overflow-x-auto py-2 no-scrollbar"
            aria-label="Tabs"
            role="tablist"
          >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                onClick={() => setActiveTab(tab.id)}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-controls={`tab-panel-${tab.id}`}
                aria-selected={isActive}
                className={`
                  flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap
                  ${
                    isActive
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
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

export function TabPanel({ id, children }: TabPanelProps) {
  return (
    <div role="tabpanel" id={`tab-panel-${id}`} aria-labelledby={`tab-${id}`}>
      {children}
    </div>
  );
}
