import Link from "next/link";
import { ToggleMode } from "./toggle-mode";

export function NavBar() {
  return (
    <nav className="my-4 flex justify-between items-center">
      <Link href="/" className="font-bold uppercase">
        skld
      </Link>

      <div className="flex gap-8">
        <Link className="font-light" href="/catalog">
          catalog
        </Link>
        <Link className="font-light" href="/dashboard">
          dashboard
        </Link>
      </div>
      <ToggleMode />
    </nav>
  );
}
