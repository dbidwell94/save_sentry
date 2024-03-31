import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="w-full h-auto py-1 px-10 border-b border-gray-400">
      <div className="flex flex-row justify-between">
        <NavLink to="/" is="div">
          <h1 className="text-cyan-400 font-bold text-3xl">Save Sentry</h1>
        </NavLink>
      </div>
    </nav>
  );
}
