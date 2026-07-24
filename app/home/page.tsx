import HomePage from "@/app/pages/home";
import LegacyAdminRoute from "@/app/pages/legacy-admin-route";

export default function Page() {
  return (
    <LegacyAdminRoute>
      <HomePage />
    </LegacyAdminRoute>
  );
}
