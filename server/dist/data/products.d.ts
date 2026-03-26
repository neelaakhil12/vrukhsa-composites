export interface Product {
    id: string;
    name: string;
    category: string;
    subCategory: string;
    description: string;
    images: string[];
    price: number;
    originalPrice: number;
    discountPercentage: number;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    stockQuantity: number;
    variants: {
        name: string;
        options: string[];
    }[];
    specifications: Record<string, string>;
    warranty: string;
    seller: string;
    isSponsored: boolean;
}
export declare const categories: {
    id: string;
    name: string;
    icon: string;
}[];
export declare const products: Product[];
export declare const banners: {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    link: string;
}[];
//# sourceMappingURL=products.d.ts.map