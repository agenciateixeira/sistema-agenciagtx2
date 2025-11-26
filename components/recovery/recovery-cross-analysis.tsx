'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { TrendingUp, DollarSign, Clock, Tag } from 'lucide-react';

interface CrossData {
  cohortByUTM: any[];
  cohortByValue: any[];
  timeByValue: any[];
  utmByValue: any[];
}

interface Props {
  crossData: CrossData;
}

const COLORS = {
  lowValue: '#10b981', // green
  midValue: '#f59e0b', // amber
  highValue: '#ef4444', // red
  primary: '#3b82f6', // blue
  secondary: '#8b5cf6', // purple
};

export function RecoveryCrossAnalysis({ crossData }: Props) {
  if (!crossData) {
    return <div className="text-center text-gray-600 py-8">Carregando cruzamentos...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Cruzamento de Dados Avançado</h2>
      </div>

      {/* 1. Coorte x UTM Source */}
      {crossData.cohortByUTM && crossData.cohortByUTM.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Performance por UTM Source ao Longo do Tempo
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Veja quais sources trazem mais carrinhos e têm melhor taxa de recuperação em cada semana
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossData.cohortByUTM.slice(0, 20)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="source"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  content={<CustomTooltip type="cohortUTM" />}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Legend />
                <Bar dataKey="carts" fill={COLORS.primary} name="Carrinhos" />
                <Bar dataKey="recovered" fill={COLORS.lowValue} name="Recuperados" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 2. Coorte x Valor */}
      {crossData.cohortByValue && crossData.cohortByValue.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Faixas de Valor ao Longo do Tempo
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Entenda como carrinhos de diferentes valores performam ao longo das semanas
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={crossData.cohortByValue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" fontSize={11} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip content={<CustomTooltip type="cohortValue" />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="carts"
                  stroke={COLORS.primary}
                  name="Carrinhos"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="recoveryRate"
                  stroke={COLORS.lowValue}
                  name="Taxa de Recuperação (%)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 3. Horário x Valor */}
      {crossData.timeByValue && crossData.timeByValue.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Valor do Carrinho por Horário do Dia
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Descubra em quais horários os carrinhos de maior valor são abandonados
          </p>
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.lowValue }} />
              <span>Até R$ 100</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.midValue }} />
              <span>R$ 100 - R$ 500</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.highValue }} />
              <span>Acima de R$ 500</span>
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={crossData.timeByValue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" fontSize={12} />
                <YAxis />
                <Tooltip content={<CustomTooltip type="timeValue" />} />
                <Legend />
                <Bar dataKey="lowValue" stackId="a" fill={COLORS.lowValue} name="Baixo Valor" />
                <Bar dataKey="midValue" stackId="a" fill={COLORS.midValue} name="Médio Valor" />
                <Bar dataKey="highValue" stackId="a" fill={COLORS.highValue} name="Alto Valor" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 4. UTM x Valor */}
      {crossData.utmByValue && crossData.utmByValue.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              UTM Source x Faixa de Valor
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Identifique quais sources trazem carrinhos de maior valor e suas taxas de recuperação
          </p>

          {/* Tabela detalhada */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Source
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan={2}>
                    Baixo Valor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan={2}>
                    Médio Valor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase" colSpan={2}>
                    Alto Valor
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <th></th>
                  <th className="px-2 py-2 text-center text-xs text-gray-500">Qtd</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-500">Rec%</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-500">Qtd</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-500">Rec%</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-500">Qtd</th>
                  <th className="px-2 py-2 text-center text-xs text-gray-500">Rec%</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {crossData.utmByValue.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {item.source}
                    </td>
                    <td className="px-2 py-3 text-sm text-center text-gray-600">{item.lowValue}</td>
                    <td className="px-2 py-3 text-sm text-center">
                      <span className="text-green-600 font-medium">{item.lowRecovery}%</span>
                    </td>
                    <td className="px-2 py-3 text-sm text-center text-gray-600">{item.midValue}</td>
                    <td className="px-2 py-3 text-sm text-center">
                      <span className="text-amber-600 font-medium">{item.midRecovery}%</span>
                    </td>
                    <td className="px-2 py-3 text-sm text-center text-gray-600">{item.highValue}</td>
                    <td className="px-2 py-3 text-sm text-center">
                      <span className="text-red-600 font-medium">{item.highRecovery}%</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                      {item.totalCarts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Tooltip customizado
function CustomTooltip({ active, payload, label, type }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  if (type === 'cohortUTM') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900">{data.source}</p>
        <p className="text-sm text-gray-600">Semana: {data.week}</p>
        <p className="text-sm text-blue-600">Carrinhos: {data.carts}</p>
        <p className="text-sm text-green-600">Recuperados: {data.recovered}</p>
        <p className="text-sm text-purple-600">Taxa: {data.recoveryRate}%</p>
        <p className="text-sm text-gray-700">Valor Médio: R$ {data.avgValue}</p>
      </div>
    );
  }

  if (type === 'cohortValue') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900">{data.range}</p>
        <p className="text-sm text-gray-600">Semana: {data.week}</p>
        <p className="text-sm text-blue-600">Carrinhos: {data.carts}</p>
        <p className="text-sm text-green-600">Taxa: {data.recoveryRate}%</p>
      </div>
    );
  }

  if (type === 'timeValue') {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-semibold text-gray-900">Horário: {data.hour}</p>
        <div className="mt-2 space-y-1">
          <p className="text-sm text-green-600">Baixo: {data.lowValue} (Média: R$ {data.lowAvg})</p>
          <p className="text-sm text-amber-600">Médio: {data.midValue} (Média: R$ {data.midAvg})</p>
          <p className="text-sm text-red-600">Alto: {data.highValue} (Média: R$ {data.highAvg})</p>
        </div>
        <p className="text-sm text-gray-700 mt-2 font-medium">
          Total: {data.lowValue + data.midValue + data.highValue} carrinhos
        </p>
      </div>
    );
  }

  return null;
}
