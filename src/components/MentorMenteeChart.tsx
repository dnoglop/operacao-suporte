// src/components/MentorMenteeChart.tsx

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { MentorshipData } from '../types';

interface MentorMenteeChartProps {
  data: MentorshipData[];
}

const COLORS = ['#8884d8', '#82ca9d']; // Colors for mentors and mentees

export const MentorMenteeChart: React.FC<MentorMenteeChartProps> = ({ data }) => {
  const mentorCount = data.filter(d => d['Você é?'] === 'Mentor(a)').length;
  const menteeCount = data.filter(d => d['Você é?'] === 'Mentorado(a)').length;

  const chartData = [
    { name: 'Mentores', value: mentorCount },
    { name: 'Mentorados', value: menteeCount },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Distribuição de Mentores e Mentorados</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
