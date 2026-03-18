import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, ChevronDown, User, Menu, X, Heart, Package, HelpCircle, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import { useCart } from '@/context/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="vc-header">
      <div className="container mx-auto">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/logo.jpeg" alt="Vruksha Composites" className="h-12 w-auto object-contain" />
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-[550px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vc-search w-full h-9 pr-12"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-primary hover:text-primary/80"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Login Dropdown */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-4 py-2 text-primary-foreground hover:text-primary-foreground/80">
                <User size={20} />
                <span className="font-medium">{user.name}</span>
                <ChevronDown size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/account" className="flex items-center gap-2">
                    <User size={16} /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center gap-2">
                    <Package size={16} /> Orders
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild className="text-primary font-bold">
                    <Link to="/admin" className="flex items-center gap-2">
                      <LayoutDashboard size={16} /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/wishlist" className="flex items-center gap-2">
                    <Heart size={16} /> Wishlist
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <button className="bg-white text-primary font-medium px-8 py-1 rounded-sm hover:bg-white/90">
                Login
              </button>
            </Link>
          )}

          {/* Become a Seller */}
          <Link to="/seller" className="text-primary-foreground hover:text-primary-foreground/80 font-medium">
            Become a Seller
          </Link>

          {/* Help */}
          <button className="flex items-center gap-1 text-primary-foreground hover:text-primary-foreground/80">
            <HelpCircle size={18} />
            <span className="font-medium">Help</span>
          </button>

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-2 text-primary-foreground hover:text-primary-foreground/80">
            <div className="relative">
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="font-medium">Cart</span>
          </Link>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-14 px-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} className="text-primary-foreground" /> : <Menu size={24} className="text-primary-foreground" />}
          </button>

          <Link to="/" className="flex items-center">
            <img src="/logo.jpeg" alt="Vruksha Composites" className="h-10 w-auto object-contain" />
          </Link>

          <Link to="/cart" className="relative text-primary-foreground">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="vc-search w-full h-10 pr-12"
              />
              <button
                type="submit"
                className="absolute right-0 top-0 h-full px-4 text-primary"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-card text-foreground border-t border-border animate-slide-in">
            <nav className="py-2">
              <Link to="/account" className="flex items-center gap-3 px-4 py-3 hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <User size={20} /> My Profile
              </Link>
              <Link to="/orders" className="flex items-center gap-3 px-4 py-3 hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <Package size={20} /> Orders
              </Link>
              <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                <Heart size={20} /> Wishlist
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-muted text-primary font-bold" onClick={() => setMobileMenuOpen(false)}>
                  <LayoutDashboard size={20} /> Admin Panel
                </Link>
              )}
              <div className="border-t border-border my-2" />
              <Link to="/seller" className="flex items-center gap-3 px-4 py-3 hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
                Become a Seller
              </Link>
              <button className="flex items-center gap-3 px-4 py-3 hover:bg-muted w-full text-left">
                <HelpCircle size={20} /> Help
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
