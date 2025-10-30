/**
 * Main Layout Component
 * 
 * App shell with navigation and outlet for pages.
 */

import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '@app/store/ThemeContext';
import { 
  LayoutDashboard, 
  Ticket, 
  FileText, 
  Settings, 
  Moon, 
  Sun,
  Monitor,
  BarChart3
} from 'lucide-react';

export function MainLayout() {
  const location = useLocation();
  const { theme, setTheme, actualTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tickets', href: '/tickets', icon: Ticket },
    { name: 'Templates', href: '/templates', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const ThemeIcon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold text-primary">Ticket Tracker</h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema de Tracking</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-border">
            <button
              onClick={cycleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-accent transition-colors"
              title={`Current: ${theme} (Click to change)`}
            >
              <ThemeIcon className="w-5 h-5" />
              <span className="text-sm capitalize">{theme}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

