import Link from "next/link";
import { ToggleMode } from "./toggle-mode";

export function NavBar() {
  return (
    <nav className="mx-16 my-4 flex justify-between items-center">
      <Link href="/">skld</Link>
      <ToggleMode />
    </nav>
  );
}
