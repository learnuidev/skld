export const PageHeader = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="mb-12 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-light tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      {children}
    </div>
  );
};
