import CreatePage from "@/app/pages/create";
import LegacyAdminRoute from "@/app/pages/legacy-admin-route";

export default function Page() {
  return (
    <LegacyAdminRoute>
      <CreatePage />
    </LegacyAdminRoute>
  );
}
