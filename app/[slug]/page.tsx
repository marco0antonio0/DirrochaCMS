import PublicPostPage from "@/app/pages/public/post";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicPostPage slug={slug} />;
}
