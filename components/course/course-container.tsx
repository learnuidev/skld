export const CourseContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="pb-40 lg:pb-40">{children}</div>
    </div>
  );
};
