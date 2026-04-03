import { ProductRepository } from "./product.repository";

export class ProductService {
  private repository = new ProductRepository();

  async fetchProducts(params: any) {
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const offset = (page - 1) * limit;

    return await this.repository.getProducts(
      limit,
      offset,
      params.search,
      params.minPrice ? parseFloat(params.minPrice) : undefined,
      params.maxPrice ? parseFloat(params.maxPrice) : undefined,
      params.sortBy,
      params.sortOrder
    );
  }

  async addProduct(data: any) {
    return await this.repository.createProduct(
      data.name,
      data.description,
      data.price,
      data.stock
    );
  }
}
