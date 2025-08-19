// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = { name: string; href: string; exact?: boolean; icon: React.ReactNode };

const sections: { title?: string; links: NavLink[] }[] = [
  { links: [{ name: "Dashboard", href: "/", exact: true, icon: <IconHome /> }] },
  {
    title: "Catalog",
    links: [
      { name: "Items", href: "/items", icon: <IconBox /> },
      { name: "Warehouses", href: "/warehouses", icon: <IconWarehouse /> },
    ],
  },
  {
    title: "Trade",
    links: [
      { name: "Purchases", href: "/purchases", icon: <IconCartDown /> },
      { name: "New Purchase", href: "/purchases/new", icon: <IconPlusDoc /> },
      { name: "Sales", href: "/sales", icon: <IconCartUp /> },
      { name: "New Sale", href: "/sales/new", icon: <IconPlusDoc /> },
    ],
  },
  { title: "Inventory", links: [{ name: "Stock on Hand", href: "/stock", icon: <IconLayers /> }] },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky left-0 top-0 h-screen w-64 shrink-0 border-r border-neutral-800 bg-black p-4 text-white">
      {/* Brand */}
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-black">D</div>
        <div className="font-bold tracking-tight">Dealer App</div>
      </div>

      <nav className="space-y-6">
        {sections.map((sec, i) => (
          <div key={i}>
            {sec.title ? (
              <div className="mb-2 select-none text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {sec.title}
              </div>
            ) : null}
            <ul className="flex flex-col gap-1">
              {sec.links.map((l) => {
                const active = l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                        "text-white/85 hover:text-white hover:bg-black",
                        active ? "bg-black text-white shadow-sm" : "",
                      ].join(" ")}
                    >
                      {/* Left active indicator */}
                      <span
                        className={[
                          "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full",
                          active ? "bg-white" : "bg-transparent",
                        ].join(" ")}
                      />
                      {/* Icon */}
                      <span className="opacity-90 group-hover:opacity-100">{l.icon}</span>
                      {/* Label */}
                      <span className="truncate">{l.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-4 right-4 border-t border-neutral-800 pt-4 text-xs text-neutral-400">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-neutral-800 text-xs">N</div>
          <div className="truncate">Logged in</div>
        </div>
      </div>
    </aside>
  );
}

/* --- tiny inline icons (inherit currentColor) --- */

function baseIcon(props: React.SVGProps<SVGSVGElement>) {
  return {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

function IconHome() {
  return (
    <svg {...baseIcon({})}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v9h14v-9" />
    </svg>
  );
}
function IconBox() {
  return (
    <svg {...baseIcon({})}>
      <path d="M3 7l9 4 9-4" />
      <path d="M3 7v10l9 4 9-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}
function IconWarehouse() {
  return (
    <svg {...baseIcon({})}>
      <path d="M3 9l9-5 9 5" />
      <path d="M4 10v9h16v-9" />
      <path d="M8 19v-6h8v6" />
    </svg>
  );
}
function IconCartDown() {
  return (
    <svg {...baseIcon({})}>
      <path d="M3 4h2l1 7h11l2-5H7" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M12 7v6m0 0-2-2m2 2 2-2" />
    </svg>
  );
}
function IconCartUp() {
  return (
    <svg {...baseIcon({})}>
      <path d="M3 4h2l1 7h11l2-5H7" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M12 13V7m0 0-2 2m2-2 2 2" />
    </svg>
  );
}
function IconPlusDoc() {
  return (
    <svg {...baseIcon({})}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4" />
      <path d="M10 12h6M13 9v6" />
    </svg>
  );
}
function IconLayers() {
  return (
    <svg {...baseIcon({})}>
      <path d="M12 2l9 5-9 5L3 7z" />
      <path d="M3 12l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </svg>
  );
}
