import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FileText, FolderOpen, Database, BarChart3, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storage } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { toast } = useToast();

  const menuItems = [
    { path: '/proposals', label: 'Proposals', icon: FileText },
    { path: '/projects', label: 'Projects', icon: FolderOpen },
    { path: '/reusable-data', label: 'Reusable Data', icon: Database },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
  ];

  const handleExport = () => {
    const data = storage.exportAll();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phixforge-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast({ title: 'Data exported successfully' });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (storage.importAll(content)) {
            toast({ title: 'Data imported successfully' });
            window.location.reload();
          } else {
            toast({ title: 'Import failed', variant: 'destructive' });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r bg-card">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">PhixForge</h1>
          <p className="text-sm text-muted-foreground">Proposals Manager</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t space-y-2">
          <Button variant="outline" className="w-full" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="w-full" onClick={handleImport}>
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default Layout;
