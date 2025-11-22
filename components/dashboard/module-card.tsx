import { modules } from '@/data/dashboard';

interface ModuleProps {
  module: (typeof modules)[number];
}

const statusColors: Record<string, string> = {
  operacional: 'text-brand-700 bg-brand-50 border-brand-200',
  beta: 'text-amber-700 bg-amber-50 border-amber-200',
  'em testes': 'text-blue-700 bg-blue-50 border-blue-200',
  roadmap: 'text-gray-700 bg-gray-50 border-gray-200'
};

export function ModuleCard({ module }: ModuleProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-gray-900">{module.title}</h3>
        <span className={`rounded-md border px-2.5 py-1 text-xs font-medium ${statusColors[module.status] || 'border-gray-200 bg-gray-50 text-gray-700'}`}>
          {module.status}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">{module.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {module.highlights.map((item) => (
          <span key={item} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
