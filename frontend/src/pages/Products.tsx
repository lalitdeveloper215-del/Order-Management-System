import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setProducts, setLoading, setPage, setFilters, type RootState, type ProductResponse } from "../store/store";
import { useApi } from "../hooks/useApi";
import { usePagination, DOTS } from "../hooks/usePagination";

const Products = () => {
  const dispatch = useDispatch();
  const { items, total, loading, page, filters } = useSelector((state: RootState) => state.products);
  const { api, execute, error } = useApi();
  const limit = 10;

  const fetchProducts = useCallback(async () => {
    dispatch(setLoading(true));
    const response = await execute<ProductResponse>(
      api.get("/products", {
        params: { page, limit, ...filters },
      })
    );
    if (response) {
      dispatch(setProducts({ products: response.products, total: response.total }));
    }
    dispatch(setLoading(false));
  }, [page, filters, api, dispatch, execute]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const { paginationRange, goToNextPage, goToPrevPage, totalPages } = usePagination(total, limit, page, (p) => dispatch(setPage(p)));

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  return (
    <div className="glass-card fade-in">
      <div className="header" style={{ marginBottom: "1rem", borderBottom: "none" }}>
        <h2>Product Catalog</h2>
        {error && <span className="badge error">{error}</span>}
      </div>

      <div className="filters-bar">
        <input name="search" placeholder="Search products..." className="input" value={filters.search} onChange={handleFilterChange} style={{ flex: 2 }} />
        <input name="minPrice" type="number" placeholder="Min Price" className="input" value={filters.minPrice} onChange={handleFilterChange} style={{ flex: 1 }} />
        <input name="maxPrice" type="number" placeholder="Max Price" className="input" value={filters.maxPrice} onChange={handleFilterChange} style={{ flex: 1 }} />
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Price ($)</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {items.map((prod) => (
                  <tr key={prod.id}>
                    <td>{prod.id}</td>
                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{prod.description}</td>
                    <td>${Number(prod.price).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${prod.stock > 0 ? "success" : ""}`}>{prod.stock > 0 ? `${prod.stock} in stock` : "Out of stock"}</span>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={goToPrevPage}>Prev</button>
              {paginationRange.map((num, i) => {
                if (num === DOTS) {
                  return <span key={`dots-${i}`} className="dots">...</span>;
                }
                return (
                  <button key={num} className={page === num ? "active" : ""} onClick={() => dispatch(setPage(num as number))}>
                    {num}
                  </button>
                );
              })}
              <button disabled={page === totalPages} onClick={goToNextPage}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
