"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquareHeart, Mic, Settings, Sparkles } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Text Chat', href: '/chat', icon: MessageSquareHeart },
  { name: 'Voice Journal', href: '/voice', icon: Mic },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#11141D] border-r border-indigo-900/50 flex flex-col fixed left-0 top-0">
      {/* Logo / Brand */}
      <div className="h-20 flex items-center px-8 border-b border-indigo-900/50">
        <Sparkles className="text-indigo-400 mr-3" size={24} />
        <h1 className="text-lg font-medium text-purple-200 tracking-wide">Mana</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-indigo-900/30 text-indigo-200 shadow-[inset_0_0_12px_rgba(129,140,248,0.1)]' 
                  : 'text-indigo-500 hover:bg-indigo-900/10 hover:text-indigo-300'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-colors duration-200 ${
                  isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400'
                }`} 
              />
              <span className="font-light">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Element */}
      <div className="p-6 text-xs text-indigo-700/50 font-light text-center border-t border-indigo-900/50">
        Mana Wellness Companion
      </div>
    </aside>
  );
}