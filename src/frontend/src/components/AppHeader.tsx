import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, Search, Zap } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin, useProfile } from "../hooks/useQueries";

export function AppHeader() {
  const { data: profile } = useProfile();
  const { data: isAdmin } = useIsAdmin();
  const { clear } = useInternetIdentity();
  const navigate = useNavigate();

  const username = profile?.username || "User";
  const points = profile ? Number(profile.totalPoints) : 0;

  function handleLogout() {
    clear();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 h-14">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 mr-4">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">AdEarn</span>
        </Link>

        {/* Nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          <Link
            to="/dashboard"
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            activeProps={{
              className:
                "px-3 py-1.5 text-sm font-medium rounded-md text-primary bg-accent",
            }}
            data-ocid="nav.dashboard.link"
          >
            Dashboard
          </Link>
          <Link
            to="/earn"
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            activeProps={{
              className:
                "px-3 py-1.5 text-sm font-medium rounded-md text-primary bg-accent",
            }}
            data-ocid="nav.earn.link"
          >
            Earn
          </Link>
          <Link
            to="/rewards"
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            activeProps={{
              className:
                "px-3 py-1.5 text-sm font-medium rounded-md text-primary bg-accent",
            }}
            data-ocid="nav.rewards.link"
          >
            Rewards
          </Link>
          <Link
            to="/community"
            className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            activeProps={{
              className:
                "px-3 py-1.5 text-sm font-medium rounded-md text-primary bg-accent",
            }}
            data-ocid="nav.community.link"
          >
            Community
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              activeProps={{
                className:
                  "px-3 py-1.5 text-sm font-medium rounded-md text-primary bg-accent",
              }}
              data-ocid="nav.admin.link"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden sm:block w-48">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search ads..."
            className="pl-8 h-8 text-sm rounded-full bg-muted border-0"
            data-ocid="header.search_input"
          />
        </div>

        {/* Bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          data-ocid="header.notifications.button"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-2 hover:bg-muted rounded-lg px-2 py-1 transition-colors"
              data-ocid="header.user.dropdown_menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-tight">
                  {username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {points.toLocaleString()} pts
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate({ to: "/rewards" })}>
              My Rewards
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                Admin Panel
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
              data-ocid="header.logout.button"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
