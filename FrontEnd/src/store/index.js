// importing all the libraries and moosules.
import { configureStore, createSlice } from '@reduxjs/toolkit';
import { http } from '../api/http';

// insitial state for reducers
const initialProductsState = { 
            allProducts: [], 
            cart: [], 
            cartItems: 0, 
            flashMessage: null, 
            // current sort option as structured config
            // e.g. { field: 'price', direction: 'asc' }
            sort: { field: null, direction: 'asc' }, 
            isLoading: false,
            productDetails: null 
        };

// creating a reducer and action Items
const products = createSlice({
    name: 'products',
    initialState: initialProductsState,
    reducers: {
        setProducts(state, actions) {
            // always keep the raw list from the API; sorting is applied in selectors/components
            state.allProducts = actions.payload;
        },
        getCartValue(state, actions) {
            const cart = JSON.parse(localStorage.getItem('CART'));
            state.cartItems = cart?.length || 0;
        },
        getCartProducts(state){
            state.cart = JSON.parse(localStorage.getItem('CART')) || [];
        },
        getProductDetails(state, actions) {
            const {payload} = actions;
            state.productDetails = state.allProducts.filter((i) => Number(i.id) === Number(payload))[0];
        },
        deleteProduct(state, actions) {
            state.allProducts = state.allProducts.filter((i) => Number(i.id) !== Number(actions.payload))
        },
        updateProducts(state, actions) {
            state.allProducts = state.allProducts.map((i) => {
                if(Number(i.id) === Number(actions.payload.id)) {
                    return actions.payload;
                }
                return i;
            })
        },
        setFlashMessage(state, actions) {
            state.flashMessage = actions.payload;
        },
        setLoading(state, actions) {
            state.isLoading = actions.payload;
        },
        // store current sort option (e.g. { field: 'price', direction: 'asc' })
        setSort(state, actions) {
            state.sort = actions.payload;
        },
        addToCart(state, actions) {
            const item = {...actions.payload};
            //get from localStorage
            const itemInCart = JSON.parse(localStorage.getItem('CART'));
            if(!itemInCart || itemInCart.length < 1) {
                item.quantity = 1;
                localStorage.setItem('CART', JSON.stringify([item]));
                state.cartItems = 1;
                 // flash message
                state.flashMessage = "Product Added To Cart"
                return;
            }

            //check Item already exists in cart
            let isItemExists = false;
            itemInCart.forEach((i, index, arr) => {
                if(i.id === item.id) {
                    arr[index].quantity = Number(arr[index].quantity) + 1;
                    isItemExists = true;
                }
            })

            if(isItemExists) {
                localStorage.setItem('CART', JSON.stringify(itemInCart));
                state.cartItems = itemInCart.length;
                 // flash message
                state.flashMessage = "Product Added To Cart"
                return;
            }

            //add to cart
            item.quantity = 1;
            itemInCart.push(item);

            //add to localStorage
            localStorage.setItem('CART', JSON.stringify(itemInCart))
             // flash message
             state.flashMessage = "Product Added To Cart"
             state.cartItems = itemInCart.length;
        },
        // addNewProduct(state, actions) {
        //     const {payload} = actions;
        //     const newProduct = {
        //         category: payload.category,
        //         description: payload.description,
        //         id: Number(payload.id),
        //         image: payload.image,
        //         price: payload.price,
        //         rating: {
        //             rate: payload.rate, 
        //             count: payload.count
        //         },
        //         title: payload.title
        //     }

        //     (debug) removed console logging
        //     state.allProducts.push(newProduct);
        //     // flash message
        //     state.flashMessage = "Product Added Successfully"
        // },
        deleteProductFromCart(state, actions) {
            const cart = state.cart.filter((i) => Number(i.id) !== Number(actions.payload))
            localStorage.setItem('CART', JSON.stringify(cart));
            state.cartItems = cart.length || 0;
            state.cart = cart;
            state.flashMessage = "deleted Successfully!!"
        }
    }
});

// creating store and passing to the components
const store = configureStore({
    reducer: products.reducer
});

// Normalize backend products into the UI schema (legacy fields like title/image/rating).
const normalizeProduct = (p) => ({
    ...p,
    title: p.title ?? p.name ?? '',
    name: p.name ?? p.title ?? '',
    image: p.image ?? 'https://via.placeholder.com/300x300?text=No+Image',
    category: p.category ?? '',
    rating: p.rating ?? { rate: 0, count: 0 },
});

const normalizeProducts = (arr) =>
    Array.isArray(arr) ? arr.map(normalizeProduct) : [];

// async actions 
//fetches the all products fromt he database
// optionally accepts a sort config { field, direction } to request server-side sorting
export const fetchProducts = (sortConfig) => {
    return async (dispatch, getState) => {

        const fetchAllProducts = async() => {
            // use provided sortConfig or current state.sort
            const currentSort = sortConfig || getState().sort;

            const items = await http.get('/api/products', {
                query: currentSort?.field
                    ? {
                        sortField: currentSort.field,
                        sortDirection: currentSort.direction,
                    }
                    : undefined,
            });
            dispatch(products.actions.setProducts(normalizeProducts(items)))
        }

        dispatch(products.actions.setLoading(true));
        try {
           await fetchAllProducts()
        } catch(err) {
            dispatch(products.actions.setFlashMessage("Something went wrong!"))
        } finally {
            dispatch(products.actions.setLoading(false));
        }

    };
}

// inserts a new product into the database
export const addNewProduct = (productData) => {
    return async (dispatch, getState) => {

        const fetchAllProducts = async() => {
            const created = await http.post('/api/products', {
                name: productData.title,
                price: Number(productData.price),
                description: productData.description,
            });
            dispatch(products.actions.setFlashMessage("Product Added Successfully"));
            // optimistic update (if backend allows write)
            const normalized = normalizeProduct(created);
            const current = getState().allProducts || [];
            dispatch(products.actions.setProducts([...current, normalized]));
        }

        // error handling
        try {
           await fetchAllProducts()
        } catch(err) {
            dispatch(products.actions.setFlashMessage("Something went wrong!"));
        }

    };
}

// takes id and delete the record with that id
export const deleteProduct = (id) => {
    return async (dispatch) => {
        const deleteP = async () => {
            await http.del(`/api/products/${id}`);
            dispatch(products.actions.deleteProduct(id));
            dispatch(products.actions.setFlashMessage("Deleted Successfully"));
        }
        
        // error handling
        try {
            await deleteP();
        } catch(err) {
            dispatch(products.actions.setFlashMessage("Something went wrong!"))
        }
    }
}

// used to update the products with specific id
export const updateProduct = (id, productData) => {
    return async (dispatch) => {

        const updateP = async() => {
            const updated = await http.put(`/api/products/${id}`, {
                name: productData.title,
                price: Number(productData.price),
                description: productData.description,
            });

            dispatch(products.actions.updateProducts(normalizeProduct(updated)));
            dispatch(products.actions.setFlashMessage("Updated Successfully"));
        }

        // error handling
        try {
           await updateP()
        } catch(err) {
            dispatch(products.actions.setFlashMessage("Something went wrong!"));
        }

    }
}

export default store;

export const actions = products.actions;
