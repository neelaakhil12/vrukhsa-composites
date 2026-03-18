import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BannerCarousel from '@/components/BannerCarousel';
import CategoryGrid from '@/components/CategoryGrid';
import ProductSection from '@/components/ProductSection';
import { fetchProducts, fetchSettings } from '@/api/client';
import { Product } from '@/data/products';

const Index = () => {
  const { data: allProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts()
  });

  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetchSettings(),
    initialData: { banners: [], categories: [] }
  });

  const isLoading = productsLoading || settingsLoading;

  // Client-side filtering
  const featuredProducts = allProducts.slice(0, 6);
  const flashSaleProducts = allProducts.filter((p: Product) => p.discountPercentage >= 30).slice(0, 6);

  // Helper to get products by category
  const getCategoryProducts = (categoryId: string) => {
    return allProducts.filter((p: Product) => p.category === categoryId).slice(0, 4);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!allProducts.length && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Unable to load products</h2>
        <p className="text-muted-foreground mb-4">
          We're having trouble connecting to our server. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-vc-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Banner Carousel */}
        <BannerCarousel banners={siteSettings.banners} />
        <br />
        {/* Category Grid */}
        <CategoryGrid categories={siteSettings.categories} />

        {/* Flash Sale Section */}
        {flashSaleProducts.length > 0 && (
          <ProductSection
            title="Flash Sale"
            subtitle="Grab the best deals before they're gone!"
            products={flashSaleProducts}
            viewAllLink="/search?sale=flash"
            badge="LIVE"
            countdown="05:23:45"
          />
        )}

        {/* Featured Products */}
        <div className="my-2 md:my-4">
          <ProductSection
            title="Best Sellers"
            subtitle="Top picks loved by customers"
            products={featuredProducts}
            viewAllLink="/search"
          />
        </div>

        {/* Dynamic Category Sections */}
        {siteSettings.categories.map((category: any) => {
          const categoryProducts = getCategoryProducts(category.id);
          // Only render section if there are products
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="my-2 md:my-4">
              <ProductSection
                title={category.name}
                subtitle={`Explore our collection of ${category.name}`}
                products={categoryProducts}
                viewAllLink={`/search?category=${encodeURIComponent(category.id)}`}
              />
            </div>
          );
        })}

        {/* Promotional Banner */}
        <section className="container mx-auto px-4 my-6">
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 md:p-12 text-primary-foreground">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Expertise in Advanced Materials
              </h2>
              <p className="text-primary-foreground/90 mb-6">
                Discover the power of natural fibers and nanotechnology with Vruksha Composites.
              </p>
              <button className="btn-vc-secondary">
                Contact Us
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
