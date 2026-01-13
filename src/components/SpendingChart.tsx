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

interface ChartData {
    name: string;
    expenditure: number;
    score: number;
}

interface SpendingChartProps {
    data: ChartData[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ data }) => {
    return (
        <div className="w-full h-[350px] relative">
            <div className="absolute top-0 right-0 flex items-center space-x-4 text-xs font-medium">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                    <span>Expenditure</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <span>Smart Score</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 40, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <pattern id="dotted" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="#e5e7eb" />
                        </pattern>
                    </defs>

                    <rect width="100%" height="100%" fill="transparent" />
                    <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke="#f3f4f6"
                    />

                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 500 }}
                        dy={15}
                    />
                    <YAxis
                        hide={true}
                        domain={[0, 'auto']}
                    />

                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex flex-col space-y-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{payload[0].payload.name}</p>
                                        <p className="text-sm font-bold text-red-600">Spent: ${payload[0].value}</p>
                                        <p className="text-sm font-bold text-green-600">Score: {payload[1].value}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="expenditure"
                        stroke="#ef4444"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorExp)"
                        animationDuration={2000}
                    />
                    <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#22c55e"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorScore)"
                        animationDuration={2000}
                    />

                    {/* Optional: Add a highlight dot for the latest value */}
                    {data.length > 0 && (
                        <ReferenceDot
                            x={data[data.length - 1].name}
                            y={data[data.length - 1].score}
                            r={6}
                            fill="#22c55e"
                            stroke="#fff"
                            strokeWidth={3}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingChart;
