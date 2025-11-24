'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddIntegrationModal } from './add-integration-modal';

export function AddIntegrationButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        <Plus className="h-4 w-4" />
        Adicionar Integração
      </button>

      {isOpen && (
        <AddIntegrationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
