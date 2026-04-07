import { useEffect, useState } from "react";
import { BarPanel, PiePanel } from "../components/ChartPanel";
import PageHeader from "../components/PageHeader";
import { getAdminAnalytics } from "../services/api";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => setData(await getAdminAnalytics());
    load();
  }, []);

  return (
    <>
      <PageHeader title="Analytics Dashboard" description="A focused analytics page for trends, growth, and insurance activity." />
      <div className="split-layout">
        <BarPanel title="Symptom Trends" data={data?.symptom_trends || []} />
        <PiePanel title="Appointment Trends" data={data?.appointment_trends || []} />
      </div>
      <div style={{ marginTop: 18 }}>
        <BarPanel title="User Growth" data={data?.user_growth || []} />
      </div>
    </>
  );
}
