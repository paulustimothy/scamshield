'use client';

import { motion } from 'framer-motion';
import type { HeatMeterData } from '@/lib/types';
import { HEAT_METER_LABELS } from '@/lib/constants';

interface ScamHeatMeterProps {
  data: HeatMeterData;
}

function getBarColor(value: number) {
  if (value <= 30) return 'bg-emerald-500';
  if (value <= 60) return 'bg-amber-500';
  if (value <= 80) return 'bg-orange-500';
  return 'bg-red-500';
}

function getLabel(value: number) {
  if (value <= 30) return 'Rendah';
  if (value <= 60) return 'Sedang';
  if (value <= 80) return 'Tinggi';
  return 'Sangat Tinggi';
}

export default function ScamHeatMeter({ data }: ScamHeatMeterProps) {
  const metrics = [
    { id: 'urgencyManipulation', label: HEAT_METER_LABELS.urgencyManipulation.label, value: data.urgencyManipulation },
    { id: 'fearManipulation', label: HEAT_METER_LABELS.fearManipulation.label, value: data.fearManipulation },
    { id: 'fakeAuthority', label: HEAT_METER_LABELS.fakeAuthority.label, value: data.fakeAuthority },
    { id: 'financialRisk', label: HEAT_METER_LABELS.financialRisk.label, value: data.financialRisk },
    { id: 'impersonation', label: HEAT_METER_LABELS.impersonation.label, value: data.impersonation },
  ];

  return (
    <div className="space-y-4">
      {metrics.map((metric, i) => (
        <div key={metric.id} className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{metric.label}</span>
            <span className="font-medium text-foreground">{getLabel(metric.value)}</span>
          </div>
          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metric.value}%` }}
              transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
              className={`h-full rounded-full ${getBarColor(metric.value)}`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
