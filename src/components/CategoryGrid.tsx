import { Link } from 'react-router-dom';
import { getImageUrl } from '@/lib/utils';

const CategoryGrid = ({ categories = [] }: { categories?: any[] }) => {
  if (categories.length === 0) return null;
  return (
    <section className="bg-card py-4 overflow-hidden">
      <div className="container mx-auto px-0 md:px-4">
        <div className="flex overflow-x-auto gap-3 md:gap-6 scrollbar-hide py-2 px-4 md:px-0">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/search?category=${category.id}`}
              className="category-card flex-shrink-0 min-w-[70px] md:min-w-[100px] flex flex-col items-center group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden border border-border">
                {category.image ? (
                  <img 
                    src={getImageUrl(category.image)} 
                    alt={category.name} 
                    className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-110" 
                  />
                ) : (
                  <span className="text-3xl md:text-4xl transition-transform duration-300 group-hover:scale-110">
                    {category.icon || '📦'}
                  </span>
                )}
              </div>
              <span className="text-xs md:text-sm font-medium text-center whitespace-nowrap">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
