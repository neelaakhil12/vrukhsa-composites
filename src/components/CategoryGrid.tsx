import { Link } from 'react-router-dom';
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
              className="category-card flex-shrink-0 min-w-[70px] md:min-w-[100px] flex flex-col items-center"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-muted rounded-full flex items-center justify-center text-3xl md:text-4xl">
                {category.icon}
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
