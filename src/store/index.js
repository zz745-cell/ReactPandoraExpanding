// importing all the libraries and moosules.
import { configureStore, createSlice } from '@reduxjs/toolkit';

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
            console.log(payload, state.allProducts)
            state.productDetails = state.allProducts.filter((i) => Number(i.id) === Number(payload))[0];
            console.log(state.productDetails)
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
            console.log(actions.payload)
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
            console.log(actions);
            const item = {...actions.payload};
            //get from localStorage
            const itemInCart = JSON.parse(localStorage.getItem('CART'));
            console.log(itemInCart);
            if(!itemInCart || itemInCart.length < 1) {
                item.quantity = 1;
                console.log(item);
                localStorage.setItem('CART', JSON.stringify([item]));
                state.cartItems = 1;
                 // flash message
                state.flashMessage = "Product Added To Cart"
                return;
            }

            console.log(1);
            //check Item already exists in cart
            let isItemExists = false;
            itemInCart.forEach((i, index, arr) => {
                if(i.id === item.id) {
                    arr[index].quantity = Number(arr[index].quantity) + 1;
                    isItemExists = true;
                }
            })
            console.log(isItemExists);

            if(isItemExists) {
                localStorage.setItem('CART', JSON.stringify(itemInCart));
                state.cartItems = itemInCart.length;
                 // flash message
                state.flashMessage = "Product Added To Cart"
                return;
            }
            console.log(2);

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

        //     console.log(newProduct);
        //     state.allProducts.push(newProduct);
        //     // flash message
        //     state.flashMessage = "Product Added Successfully"
        // },
        deleteProductFromCart(state, actions) {
            const cart = state.cart.filter((i) => Number(i.id) !== Number(actions.payload))
            console.log(cart);
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

// async actions 
//fetches the all products fromt he database
// optionally accepts a sort config { field, direction } to request server-side sorting
export const fetchProducts = (sortConfig) => {
    return async (dispatch, getState) => {

        const fetchAllProducts = async() => {
            // use provided sortConfig or current state.sort
            const currentSort = sortConfig || getState().sort;

            const params = new URLSearchParams();
            if (currentSort && currentSort.field) {
                params.append('sortField', currentSort.field);
                if (currentSort.direction) {
                    params.append('sortDirection', currentSort.direction);
                }
            }

            const queryString = params.toString();
            const url = `https://ecommerce-api-ebon.vercel.app/products${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url);
            
            if(!response.ok) {
                throw new Error('Something went wrong - unable to fetch Products');
            }
            const { data } = await response.json();
            dispatch(products.actions.setProducts(data.products))
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
    return async (dispatch) => {

        const fetchAllProducts = async() => {
            const response = await fetch('https://ecommerce-api-ebon.vercel.app/products/create', {
                method: "POST",
                body: JSON.stringify({
                    product: productData
                }),
                headers: {"Content-type":"application/json"}
            });
            
            if(!response.ok) {
                throw new Error('Something went wrong -- fetchAllProducts');
            }
            const {data} = await response.json();
           dispatch(products.actions.setFlashMessage(data.message));
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
            const response = await fetch(`https://ecommerce-api-ebon.vercel.app/products/${id}`, {
                method: "DELETE"
            });

            const {data} = await response.json();
            dispatch(products.actions.deleteProduct(id));
            dispatch(products.actions.setFlashMessage(data.message));
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
            const response = await fetch(`https://ecommerce-api-ebon.vercel.app/products/${id}/update_quantity`, {
                method: "PUT",
                body: JSON.stringify({
                    product: {
                        ...productData,
                        ...productData.rating
                    }
                }),
                headers: {"Content-type":"application/json"}
            });
            
            if(!response.ok) {
                throw new Error('Something went wrong -- not updated');
            }
            const {data} = await response.json();

            dispatch(products.actions.updateProducts(data.product));
            dispatch(products.actions.setFlashMessage(data.message));
        }

        // error handling
        try {
           await updateP()
        } catch(err) {
            console.log(err);
            dispatch(products.actions.setFlashMessage("Something went wrong!"));
        }

    }
}

export default store;

export const actions = products.actions;
