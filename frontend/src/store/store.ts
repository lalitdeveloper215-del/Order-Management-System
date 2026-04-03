import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

// Product Slice
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  stock: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
}

export interface ProductState {
  items: Product[];
  total: number;
  loading: boolean;
  page: number;
  filters: {
    search: string;
    minPrice: string;
    maxPrice: string;
  };
}

const initialProductState: ProductState = {
  items: [],
  total: 0,
  loading: false,
  page: 1,
  filters: { search: "", minPrice: "", maxPrice: "" },
};

const productSlice = createSlice({
  name: "products",
  initialState: initialProductState,
  reducers: {
    setProducts: (state, action: PayloadAction<{ products: Product[]; total: number }>) => {
      state.items = action.payload.products;
      state.total = action.payload.total;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // reset page on filter change
    },
  },
});

// Order Slice
export interface Order {
  id: number;
  total_price: number | string;
  status: string;
  created_at: string;
}

export interface OrderResponse {
  orders: Order[];
  total: number;
}

export interface OrderState {
  items: Order[];
  total: number;
  loading: boolean;
  page: number;
  filters: {
    date: string;
    productId: string;
  };
}

const initialOrderState: OrderState = {
  items: [],
  total: 0,
  loading: false,
  page: 1,
  filters: { date: "", productId: "" }
};

const orderSlice = createSlice({
  name: "orders",
  initialState: initialOrderState,
  reducers: {
    setOrders: (state, action: PayloadAction<{ orders: Order[]; total: number }>) => {
      state.items = action.payload.orders;
      state.total = action.payload.total;
    },
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOrderPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setOrderFilters: (state, action: PayloadAction<Partial<OrderState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    }
  },
});

export const { setProducts, setLoading, setPage, setFilters } = productSlice.actions;
export const { setOrders, setOrderLoading, setOrderPage, setOrderFilters } = orderSlice.actions;

export const store = configureStore({
  reducer: {
    products: productSlice.reducer,
    orders: orderSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
