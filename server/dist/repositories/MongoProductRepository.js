"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoProductRepository = void 0;
const Product_1 = __importDefault(require("../models/Product"));
class MongoProductRepository {
    async findAll(filters = {}) {
        const { showDeleted, ...allFilters } = filters;
        if (showDeleted === 'true' || showDeleted === true) {
            return await Product_1.default.find(allFilters);
        }
        // Exclude soft-deleted products by default
        return await Product_1.default.find({ ...allFilters, isDeleted: { $ne: true } });
    }
    async findById(id) {
        return await Product_1.default.findOne({ _id: id });
    }
    async create(data) {
        const product = new Product_1.default(data);
        return await product.save();
    }
    async update(id, data) {
        return await Product_1.default.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, data, { new: true });
    }
    async delete(id) {
        const result = await Product_1.default.updateOne({ _id: id }, { isDeleted: true });
        return result.modifiedCount > 0;
    }
    async restore(id) {
        const result = await Product_1.default.updateOne({ _id: id }, { isDeleted: false });
        return result.modifiedCount > 0;
    }
}
exports.MongoProductRepository = MongoProductRepository;
