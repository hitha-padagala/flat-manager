'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '../lib/actions';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/residents', label: 'Residents' },
  { href: '/members', label: 'Society Members' },
  { href: '/owners', label: 'Owners' },
  { href: '/payments', label: 'Payments' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/rules', label: 'Rules' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="w-64 min-h-screen bg-stone-900 text-white flex flex-col">
      <div className="p-6 border-b border-stone-800">
        <h1 className="text-2xl font-bold">Flat Manager</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-orange-600 text-white'
                    : 'text-stone-300 hover:bg-stone-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-stone-800">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-center"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
