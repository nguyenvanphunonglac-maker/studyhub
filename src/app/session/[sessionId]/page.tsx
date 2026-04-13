import SessionPageClient from "./SessionPageClient";

// Required for Next.js static export (output: 'export').
// Returns a placeholder — Firebase Hosting SPA rewrite handles all real session URLs client-side.
export function generateStaticParams() {
  return [{ sessionId: "_" }];
}

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  return <SessionPageClient params={params} />;
}
