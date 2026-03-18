import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, User, Package, Heart, MapPin, CreditCard, Bell, Settings, LogOut, Edit, Plus, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const sidebarItems = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package, link: '/orders' },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart },
  { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
  { id: 'payments', label: 'Saved Cards', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const mockAddresses = [
  {
    id: '1',
    type: 'Home',
    name: 'John Doe',
    phone: '9876543210',
    address: '123 Main Street, Apartment 4B',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Work',
    name: 'John Doe',
    phone: '9876543211',
    address: 'Tech Park, Building A, Floor 5',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    isDefault: false,
  },
];

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Split name into first and last
  const nameParts = user?.name?.split(' ') || ['User'];
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  const [profile, setProfile] = useState({
    firstName,
    lastName,
    email: user?.email || '',
    phone: '',
    gender: '',
  });

  // Update profile when user changes
  useEffect(() => {
    if (user) {
      const parts = user.name?.split(' ') || ['User'];
      setProfile(p => ({
        ...p,
        firstName: parts[0] || 'User',
        lastName: parts.slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="bg-card rounded-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary hover:underline flex items-center gap-1"
              >
                <Edit size={16} />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="max-w-lg space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label>Gender</Label>
                <div className="flex gap-4 mt-2">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={profile.gender === gender}
                        onChange={(e) => setProfile(p => ({ ...p, gender: e.target.value }))}
                        disabled={!isEditing}
                        className="accent-primary"
                      />
                      {gender}
                    </label>
                  ))}
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSaveProfile}
                  className="btn-vc-primary"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>
        );

      case 'addresses':
        return (
          <div className="bg-card rounded-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Manage Addresses</h2>
              <button className="btn-vc-primary text-sm flex items-center gap-1">
                <Plus size={16} /> Add New Address
              </button>
            </div>

            <div className="space-y-4">
              {mockAddresses.map((address) => (
                <div
                  key={address.id}
                  className="border border-border rounded-sm p-4 hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-muted text-xs font-medium rounded">
                          {address.type}
                        </span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {address.address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Phone: {address.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-primary hover:underline text-sm">
                        Edit
                      </button>
                      <button className="text-destructive hover:underline text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'wishlist':
        return (
          <div className="bg-card rounded-sm p-6">
            <h2 className="text-xl font-bold mb-6">My Wishlist</h2>
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save items you like by clicking the heart icon
              </p>
              <Link to="/" className="btn-vc-primary">
                Start Shopping
              </Link>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="bg-card rounded-sm p-6">
            <h2 className="text-xl font-bold mb-6">Saved Payment Methods</h2>
            <div className="text-center py-12">
              <CreditCard size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved cards</h3>
              <p className="text-muted-foreground mb-4">
                Add a card for faster checkout
              </p>
              <button className="btn-vc-primary">
                Add New Card
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-card rounded-sm p-6">
            <h2 className="text-xl font-bold mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              {[
                { label: 'Order Updates', description: 'Get notified about order status changes' },
                { label: 'Promotions', description: 'Receive offers and discount alerts' },
                { label: 'Recommendations', description: 'Product recommendations based on your interests' },
                { label: 'Newsletter', description: 'Weekly newsletter with trending products' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-card rounded-sm p-6">
            <h2 className="text-xl font-bold mb-6">Account Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </div>
                <button className="text-primary hover:underline">Update</button>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <button className="text-primary hover:underline">Enable</button>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and data</p>
                </div>
                <button className="text-destructive hover:underline">Delete</button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground">My Account</span>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-card rounded-sm overflow-hidden sticky top-20">
              {/* Profile Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Hello,</p>
                    <p className="font-semibold">{profile.firstName} {profile.lastName}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="py-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  if (item.link) {
                    return (
                      <Link
                        key={item.id}
                        to={item.link}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Icon size={20} />
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${activeSection === item.id
                        ? 'bg-primary/5 text-primary border-r-4 border-primary'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      <Icon size={20} />
                      {item.label}
                    </button>
                  );
                })}
                <div className="border-t border-border my-2" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted text-destructive transition-colors"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
