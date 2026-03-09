export const LoadingCourseFailed = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl py-12 lg:py-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-destructive">Failed to load course</div>
        </div>
      </div>
    </div>
  );
};
