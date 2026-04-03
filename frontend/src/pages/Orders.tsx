import React, { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOrders, setOrderLoading, setOrderPage, setOrderFilters, type RootState, type OrderResponse } from "../store/store";
import { useApi } from "../hooks/useApi";
import { usePagination, DOTS } from "../hooks/usePagination";

const Orders = () => {
  const dispatch = useDispatch();
  const { items, total, loading, page, filters } = useSelector((state: RootState) => state.orders);
  const { api, execute, error } = useApi();
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    dispatch(setOrderLoading(true));
    const response = await execute<OrderResponse>(
      api.get("/orders", {
        params: { page, limit, ...filters },
      })
    );
    if (response) {
      dispatch(setOrders({ orders: response.orders, total: response.total }));
    }
    dispatch(setOrderLoading(false));
  }, [page, filters, api, dispatch, execute]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const { paginationRange, goToNextPage, goToPrevPage, totalPages } = usePagination(total, limit, page, (p) => dispatch(setOrderPage(p)));

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    dispatch(setOrderFilters({ [name]: value }));
  };

  return (
    <div className="glass-card">
      <div className="header" style={{ marginBottom: "1rem", borderBottom: "none" }}>
        <h2>Orders</h2>
        {error && <span className="badge error">{error}</span>}
      </div>

      <div className="filters-bar">
        <input name="date" type="date" className="input" value={filters.date} onChange={handleFilterChange} style={{ flex: 1 }} />
        <input name="productId" type="number" placeholder="Filter by Product ID" className="input" value={filters.productId} onChange={handleFilterChange} style={{ flex: 1 }} />
      </div>

      {loading ? (
        <div className="loader"></div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total Price ($)</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {items.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td style={{ fontWeight: 600 }}>${Number(order.total_price).toFixed(2)}</td>
                    <td><span className="badge success">{order.status}</span></td>
                    <td style={{ color: "var(--text-secondary)" }}>{new Date(order.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: "2rem", color: "var(--text-secondary)" }}>No orders found</td>
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
                  <button key={num} className={page === num ? "active" : ""} onClick={() => dispatch(setOrderPage(num as number))}>
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

export default Orders;
