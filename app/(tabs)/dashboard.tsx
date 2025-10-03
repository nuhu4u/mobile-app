import { Redirect } from 'expo-router';

export default function DashboardTab() {
  // Redirect to the actual dashboard page
  return <Redirect href="/dashboard/page" />;
}
