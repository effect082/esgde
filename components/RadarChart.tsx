
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Answer } from '../types';

interface ChartDataPoint {
  subject: string;
  A: number;
  fullMark: number;
}

interface Props {
  answers?: Answer[];
  customData?: ChartDataPoint[]; // Support for pre-calculated data (Admin)
}

export const ESGRadarChart: React.FC<Props> = ({ answers, customData }) => {
  let data: ChartDataPoint[] = [];

  if (customData) {
    data = customData;
  } else if (answers) {
    const calculateAverage = (prefix: string) => {
      const filtered = answers.filter(a => a.questionId.startsWith(prefix));
      if (filtered.length === 0) return 0;
      const sum = filtered.reduce((acc, curr) => acc + curr.rating, 0);
      return parseFloat((sum / filtered.length).toFixed(1));
    };

    data = [
      { subject: '환경 (E)', A: calculateAverage('E'), fullMark: 4 },
      { subject: '사회 (S)', A: calculateAverage('S'), fullMark: 4 },
      { subject: '지배구조 (G)', A: calculateAverage('G'), fullMark: 4 },
    ];
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4B5563', fontSize: 14, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 4]} />
          <Tooltip 
            formatter={(value: number) => [value, '점수']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Radar
            name="ESG Score"
            dataKey="A"
            stroke="#10B981"
            strokeWidth={3}
            fill="#10B981"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
