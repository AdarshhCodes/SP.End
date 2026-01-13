import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceDot,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

interface ChartData {
    name: string;
    expenditure: number;
    score: number;
}

interface SpendingChartProps {
    data: ChartData[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
    const { theme } = useTheme();

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-0 right-0 flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-gray-500 transition-colors">
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-2 shadow-lg shadow-rose-500/20" />
                    <span>Spent</span>
                </div>
                <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2 shadow-lg shadow-emerald-500/20" />
                    <span>Score</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 40, bottom: 30 }}
                >
                    <defs>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <rect width="100%" height="100%" fill="transparent" />
                    <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke={theme === 'dark' ? '#ffffff10' : '#00000010'}
                    />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 'auto']}
                    />

                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white/90 dark:bg-[#1a231e]/90 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col space-y-1 backdrop-blur-md transition-colors duration-500">
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest">{payload[0].payload.name}</p>
                                        <p className="text-sm font-bold text-rose-500 dark:text-rose-400">Spent: ${payload[0].value}</p>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Score: {payload[1].value}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="expenditure"
                        stroke="#f43f5e"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorExp)"
                        animationDuration={2000}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#10b981"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        animationDuration={2000}
                    />

                    {data.length > 0 && (
                        <ReferenceDot
                            x={data[data.length - 1].name}
                            y={data[data.length - 1].score}
                            r={6}
                            fill="#10b981"
                            stroke={theme === 'dark' ? '#1a231e' : '#ffffff'}
                            strokeWidth={3}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;
