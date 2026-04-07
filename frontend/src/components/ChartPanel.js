import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#39d0ff", "#2f6fff", "#16c5c8", "#7ea8ff", "#8bf1ff", "#0f7ddf"];

export function BarPanel({ title, data }) {
  const normalized = data.map((item) => ({ name: item.predicted_disease || item.gender || item.status || item.date_joined__date || "Unknown", total: item.total }));
  return (
    <div className="panel premium-chart-panel glossy-card">
      <h3 className="section-title">{title}</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={normalized}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(126, 168, 255, 0.22)" />
            <XAxis dataKey="name" stroke="currentColor" tick={{ fill: "currentColor", fontSize: 12 }} />
            <YAxis stroke="currentColor" tick={{ fill: "currentColor", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "rgba(9, 24, 48, 0.92)", border: "1px solid rgba(126, 168, 255, 0.22)", borderRadius: 16, color: "#fff" }} />
            <Bar dataKey="total" fill="#2f6fff" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PiePanel({ title, data }) {
  const normalized = data.map((item) => ({ name: item.gender || item.status || item.predicted_disease || "Unknown", total: item.total }));
  return (
    <div className="panel premium-chart-panel glossy-card">
      <h3 className="section-title">{title}</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie data={normalized} dataKey="total" nameKey="name" innerRadius={68} outerRadius={102} paddingAngle={4}>
              {normalized.map((entry, index) => <Cell key={entry.name + index} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "rgba(9, 24, 48, 0.92)", border: "1px solid rgba(126, 168, 255, 0.22)", borderRadius: 16, color: "#fff" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
