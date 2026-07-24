import HomeEndpointPage from "@/app/pages/home/[id]";
import LegacyAdminRoute from "@/app/pages/legacy-admin-route";

export default function Page() {
  return (
    <LegacyAdminRoute>
      <HomeEndpointPage />
    </LegacyAdminRoute>
  );
}
