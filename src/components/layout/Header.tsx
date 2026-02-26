import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmsLogo } from '@/components/icons/EmsLogo';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showNotifications?: boolean;
}

export function Header({ title, showSearch = true, showNotifications = true }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <EmsLogo size="sm" />
          {title ? (
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          ) : (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-foreground leading-tight tracking-tight">CODEBLUER</span>
              <span className="text-[10px] text-muted-foreground leading-tight">EMT & Paramedic Community</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <Search className="w-5 h-5" />
            </Button>
          )}
          {showNotifications && (
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
