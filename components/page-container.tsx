export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="pb-16 lg:pb-24 sm:pt-8 pt-2">{children}</div>
    </div>
  );
}
