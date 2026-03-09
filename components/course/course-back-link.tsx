import Link from "next/link";

export const CourseBackLink = ({
  href,
  title,
}: {
  href: string;
  title: string;
}) => {
  return (
    <div className="mb-20 sm:mt-20 mt-0">
      <Link
        href={href}
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        {title}
      </Link>
    </div>
  );
};
