export interface IReview {
    id?: number;
    productId: string;
    userId: number;
    rating: number;
    title?: string;
    comment?: string;
    status: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export declare class MySQLReviewRepository {
    findByProductId(productId: string): Promise<any[]>;
    findAll(): Promise<any[]>;
    create(data: IReview): Promise<any>;
    update(id: number, data: Partial<IReview>): Promise<any>;
    delete(id: number): Promise<boolean>;
    private updateProductStats;
}
//# sourceMappingURL=MySQLReviewRepository.d.ts.map