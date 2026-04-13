import { Link } from "react-router";

interface HeaderProps {
  links: { title: string; url: string }[];
}
export default function Header({ links }: HeaderProps) {
  return (
    <div className="bg-surface flex justify-between items-center p-4">
      <h1 className="text-3xl font-extrabold tracking-tighter">
        Trip
        <span className="text-brand-primary">Out</span>
      </h1>
      <nav className="gap-3 hidden md:flex">
        {links.map(({ title, url }) => (
          <li key={url}>
            <Link to={url}>{title}</Link>
          </li>
        ))}
      </nav>
    </div>
  );
}
