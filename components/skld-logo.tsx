export function SkldLogo({ className = "" }) {
  return (
    <div className={` ${className}`}>
      <div className="hidden dark:block">
        <svg
          width="900"
          height="900"
          viewBox="0 0 900 900"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
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
          width="900"
          height="900"
          viewBox="0 0 900 900"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
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
