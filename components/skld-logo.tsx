export function SkldLogo({ className = "" }) {
  return (
    <div className={` ${className}`}>
      <div className="hidden dark:block">
        <svg
          width="1024"
          height="1024"
          viewBox="0 0 1200 1024"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="100%" height="100%" fill="#000000" />
          <text
            x="50%"
            y="55%"
            text-anchor="middle"
            font-family="Inter, Helvetica, Arial, sans-serif"
            font-size="420"
            font-weight="700"
            fill="#ffffff"
          >
            skld
          </text>
        </svg>
      </div>

      <div className="dark:hidden block">
        <svg
          width="1024"
          height="1024"
          viewBox="0 0 1024 1024"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <rect width="100%" height="100%" fill="white" />
          <text
            x="50%"
            y="55%"
            text-anchor="middle"
            font-family="Inter, Helvetica, Arial, sans-serif"
            font-size="420"
            font-weight="700"
            fill="#2f2f2f"
          >
            skld
          </text>
        </svg>
      </div>
    </div>
  );
}
