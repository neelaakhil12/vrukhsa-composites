import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, Grid, List, ChevronDown, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { fetchProducts, fetchSettings } from '@/api/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState([0, 200000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from API
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryParam, query],
    queryFn: () => fetchProducts(categoryParam, query),
  });

  // Fetch categories from settings
  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchSettings(),
    initialData: { banners: [], categories: [] }
  });

  const isLoading = productsLoading || settingsLoading;
  const categories = siteSettings.categories;

  // Get unique brands
  const brands = useMemo(() => {
    return [...new Set(products.map((p: any) => p.seller))];
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price range filter
    result = result.filter((p: any) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p: any) => selectedBrands.includes(p.seller));
    }

    // Rating filter
    if (selectedRatings.length > 0) {
      const minRating = Math.min(...selectedRatings);
      result = result.filter((p: any) => p.rating >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a: any, b: any) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a: any, b: any) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a: any, b: any) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a: any, b: any) => (b.id || '').localeCompare(a.id || ''));
        break;
      case 'discount':
        result.sort((a: any, b: any) => b.discountPercentage - a.discountPercentage);
        break;
    }

    return result;
  }, [products, priceRange, selectedBrands, selectedRatings, sortBy]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleRating = (rating: number) => {
    setSelectedRatings(prev =>
      prev.includes(rating)
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 200000]);
    setSelectedBrands([]);
    setSelectedRatings([]);
  };

  const hasActiveFilters = selectedBrands.length > 0 || selectedRatings.length > 0 || priceRange[0] > 0 || priceRange[1] < 200000;

  const currentCategory = categories.find(c => c.id === categoryParam);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-4">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-4">
          <a href="/">Home</a>
          <span>/</span>
          {currentCategory ? (
            <>
              <span>Categories</span>
              <span>/</span>
              <span className="text-foreground">{currentCategory.name}</span>
            </>
          ) : query ? (
            <span className="text-foreground">Search: "{query}"</span>
          ) : (
            <span className="text-foreground">All Products</span>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-card rounded-sm p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="filter-section">
                <h4 className="font-medium mb-3 flex items-center justify-between cursor-pointer">
                  Categories <ChevronDown size={16} />
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(cat => (
                    <label key={cat.id} className="filter-checkbox cursor-pointer">
                      <Checkbox
                        checked={categoryParam === cat.id}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            navigate(`/search?category=${cat.id}`);
                          } else {
                            navigate('/search');
                          }
                        }}
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h4 className="font-medium mb-3">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={200000}
                  step={1000}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Brands */}
              <div className="filter-section">
                <h4 className="font-medium mb-3">Brands</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {brands.slice(0, 10).map((brand: any) => (
                    <label key={brand} className="filter-checkbox">
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <span className="truncate">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="filter-section border-b-0 pb-0">
                <h4 className="font-medium mb-3">Customer Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="filter-checkbox">
                      <Checkbox
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={() => toggleRating(rating)}
                      />
                      <span>{rating}★ & above</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort & View Controls */}
            <div className="bg-card p-4 rounded-sm mb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Showing <strong>{filteredProducts.length}</strong> results
                </span>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-border rounded-sm text-sm"
                >
                  <Filter size={16} /> Filters
                </button>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="discount">Discount</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden sm:flex border border-border rounded-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'flex flex-col gap-4'
              }>
                {filteredProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try different filters or search for something else
                </p>
                <button onClick={clearFilters} className="btn-vc-primary">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-card animate-slide-in overflow-y-auto">
            <div className="sticky top-0 bg-card p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {/* Price Range */}
              <div className="filter-section">
                <h4 className="font-medium mb-3">Price Range</h4>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={200000}
                  step={1000}
                  className="mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₹{priceRange[0].toLocaleString()}</span>
                  <span>₹{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Brands */}
              <div className="filter-section">
                <h4 className="font-medium mb-3">Brands</h4>
                <div className="space-y-2">
                  {brands.slice(0, 10).map((brand: any) => (
                    <label key={brand} className="filter-checkbox">
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleBrand(brand)}
                      />
                      <span className="truncate">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="filter-section border-b-0">
                <h4 className="font-medium mb-3">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="filter-checkbox">
                      <Checkbox
                        checked={selectedRatings.includes(rating)}
                        onCheckedChange={() => toggleRating(rating)}
                      />
                      <span>{rating}★ & above</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-card p-4 border-t border-border flex gap-4">
              <button
                onClick={clearFilters}
                className="flex-1 py-3 border border-border rounded-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 btn-vc-secondary"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Search;
