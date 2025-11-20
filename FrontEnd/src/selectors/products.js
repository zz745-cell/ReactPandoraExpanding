import { createSelector } from '@reduxjs/toolkit';

const selectAllProducts = (state) => state.allProducts;

// With server-side sorting, just return the products list from state.
export const selectSortedProducts = createSelector(
  [selectAllProducts],
  (allProducts) => allProducts || []
);


