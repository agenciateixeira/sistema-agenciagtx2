import { ReactNode } from 'react';

interface SectionTitleProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function SectionTitle({ title, description, action }: SectionTitleProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
