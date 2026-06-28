import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const COLORS = [
    "#2563eb",
    "#16a34a",
    "#f59e0b",
    "#dc2626",
    "#7c3aed",
    "#0891b2",
];

function ChartCard({
    title,
    description,
    children,
    empty,
}) {
    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-5">
                <h3 className="text-xl font-extrabold text-gray-900">
                    {title}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>
            </div>

            {empty ? (
                <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-center">
                    <div>
                        <p className="font-bold text-gray-900">
                            No chart data yet
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Data will appear as activity grows.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="h-72">
                    {children}
                </div>
            )}
        </div>
    );
}

export function AnalyticsSkeleton() {
    return (
        <div className="mb-10 grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
                <div
                    key={item}
                    className="h-96 animate-pulse rounded-3xl bg-white shadow-sm"
                />
            ))}
        </div>
    );
}

function hasData(items) {
    return Array.isArray(items) && items.some((item) => Number(item.value || 0) > 0);
}

function hasMonthlyData(items) {
    return Array.isArray(items) && items.some((item) =>
        Number(item.jobs || 0) > 0 ||
        Number(item.applications || 0) > 0 ||
        Number(item.approved_interviews || 0) > 0
    );
}

function tooltipFormatter(value) {
    return Number(value || 0).toLocaleString();
}

function AdminAnalyticsCharts({ analytics }) {
    const userStats = analytics?.user_statistics || [];
    const jobStats = analytics?.job_statistics || [];
    const applicationStats = analytics?.application_statistics || [];
    const monthlyAnalytics = analytics?.monthly_analytics || [];

    return (
        <div className="mb-10">
            <div className="mb-6">
                <span className="inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700">
                    Analytics
                </span>

                <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                    Platform Insights
                </h2>

                <p className="mt-2 max-w-3xl text-gray-500">
                    Monitor users, jobs, applications, and monthly growth from one admin-only view.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                    title="User Statistics"
                    description="Candidates, recruiters, and admin accounts."
                    empty={!hasData(userStats)}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={userStats}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={95}
                                innerRadius={52}
                                paddingAngle={3}
                            >
                                {userStats.map((entry, index) => (
                                    <Cell
                                        key={entry.name}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Job Statistics"
                    description="Active, pending, approved, rejected, and deleted jobs."
                    empty={!hasData(jobStats)}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={jobStats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={tooltipFormatter} />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                {jobStats.map((entry, index) => (
                                    <Cell
                                        key={entry.name}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Application Statistics"
                    description="Application funnel and approved interviews."
                    empty={!hasData(applicationStats)}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={applicationStats} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={130}
                                tick={{ fontSize: 11 }}
                            />
                            <Tooltip formatter={tooltipFormatter} />
                            <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#2563eb" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard
                    title="Monthly Analytics"
                    description="Jobs, applications, and approved interviews by month."
                    empty={!hasMonthlyData(monthlyAnalytics)}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyAnalytics}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="jobs"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={false}
                                name="Jobs"
                            />
                            <Line
                                type="monotone"
                                dataKey="applications"
                                stroke="#16a34a"
                                strokeWidth={3}
                                dot={false}
                                name="Applications"
                            />
                            <Line
                                type="monotone"
                                dataKey="approved_interviews"
                                stroke="#7c3aed"
                                strokeWidth={3}
                                dot={false}
                                name="Approved Interviews"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
}

export default AdminAnalyticsCharts;
