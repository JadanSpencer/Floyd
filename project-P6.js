let iconCart = document.querySelector('.icon-cart');
let closeCart = document.querySelector('.close');
let body = document.querySelector('body');
let listProductHTML = document.querySelector('.listProduct');
let listCartHtml = document.querySelector('.listCart');
let amount = document.querySelector('.icon-cart span');

let listProducts = [];
let carts = [];

// Search Elements
let searchBar = document.getElementById('search-bar');
let suggestionsList = document.getElementById('suggestions');

// Event listeners for cart functionality
iconCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});

// Function to render products based on search
const addDataToHtml = (category = '') => {
    listProductHTML.innerHTML = '';
    if (listProducts.length > 0) {
        const query = searchBar.value.toLowerCase();
        const filteredProducts = listProducts.filter(product => {
            const matchesSearch = !query || product.name.toLowerCase().includes(query);
            return category ? product.category === category && matchesSearch : matchesSearch;
        });

        filteredProducts.forEach(product => {
            let newProduct = document.createElement('div');
            newProduct.classList.add('item');
            newProduct.id = `item-${product.id}`; // Add unique ID for scrolling
            newProduct.dataset.id = product.id;
            newProduct.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <div class="price">$${product.price}</div>
                <button class="addCart">Add to cart</button>
            `;
            listProductHTML.appendChild(newProduct);
        });
    }
};

// Event listener for search input
searchBar.addEventListener('input', () => {
    const query = searchBar.value.toLowerCase();
    if (query) {
        const suggestions = listProducts.filter(product => product.name.toLowerCase().includes(query));
        displaySuggestions(suggestions);
    } else {
        suggestionsList.innerHTML = ''; // Clear suggestions
        suggestionsList.style.display = 'none';
    }
});

// Display suggestions
const displaySuggestions = (suggestions) => {
    suggestionsList.innerHTML = '';
    if (suggestions.length > 0) {
        suggestionsList.style.display = 'block';
        suggestions.forEach(product => {
            let suggestionItem = document.createElement('div');
            suggestionItem.textContent = product.name;
            suggestionItem.dataset.id = product.id;
            suggestionItem.addEventListener('click', () => {
                searchBar.value = product.name;
                suggestionsList.innerHTML = ''; // Clear suggestions
                suggestionsList.style.display = 'none';
                redirectToProductPage(product.id); // Redirect based on selected suggestion
            });
            suggestionsList.appendChild(suggestionItem);
        });
    } else {
        suggestionsList.style.display = 'none';
    }
};

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!searchBar.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});

// Handle Enter key for search
searchBar.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent the default form submission behavior
        const query = searchBar.value.toLowerCase();
        if (query) {
            const matchedProduct = listProducts.find(product => product.name.toLowerCase() === query);
            if (matchedProduct) {
                redirectToProductPage(matchedProduct.id);
            } else {
                console.error('No matching product found for query:', query);
            }
        } else {
            console.error('Search query is empty.');
        }
    }
});

// Redirect to product page and scroll to the specific item
const redirectToProductPage = (productId) => {
    const product = listProducts.find(p => p.id === productId);
    if (product) {
        const pageMapping = {
            'householdSupplies': 'project-P2.html',
            'bags': 'project-P3.html',
            'cups': 'project-P4.html',
            'lunchBox': 'project-P5.html',
            'foodContainer': 'project-P6.html',
            'other': 'project-P7.html'
        };
        const category = product.category;
        const page = pageMapping[category];
        if (page) {
            // Create URL with hash fragment for the product
            const url = new URL(page, window.location.origin);
            url.hash = `item-${productId}`;
            console.log('Redirecting to page:', url.href);
            window.location.href = url.href;
            
            // Ensure scrolling happens after page load
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const element = document.getElementById(`item-${productId}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        console.error('Element not found:', `item-${productId}`);
                    }
                }, 500); // Adjust timeout as needed
            });
        } else {
            console.error('No page found for the category:', category);
        }
    } else {
        console.error('Product not found with ID:', productId);
    }
};

// Add product to cart
listProductHTML.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('addCart')) {
        let product_id = positionClick.parentElement.dataset.id;
        addToCart(product_id);
    }
});

const addToCart = (product_id) => {
    let positionThisProductInCart = carts.findIndex((value) => value.product_id == product_id);
    if (positionThisProductInCart < 0) {
        carts.push({
            product_id: product_id,
            quantity: 1
        });
    } else {
        carts[positionThisProductInCart].quantity += 1;
    }
    addCartToHtml();
    addCarttoMemory();
};

// Update cart HTML
const addCartToHtml = () => {
    listCartHtml.innerHTML = '';
    let totalQuantity = 0;
    if (carts.length > 0) {
        carts.forEach(cart => {
            totalQuantity += cart.quantity;
            let newCart = document.createElement('div');
            newCart.classList.add('item');
            newCart.dataset.id = cart.product_id;
            let positionProduct = listProducts.findIndex((value) => value.id == cart.product_id);
            let info = listProducts[positionProduct];
            newCart.innerHTML = `
                <div class="image">
                    <img src="${info.image}" alt="${info.name}">
                </div>
                <div class="name">
                    ${info.name}
                </div>
                <div class="totalPrice">
                    $${info.price * cart.quantity}
                </div>
                <div class="quantity">
                    <span class="minus">-</span>
                    <span>${cart.quantity}</span>
                    <span class="plus">+</span>
                </div>`;
            listCartHtml.appendChild(newCart);
        });
    }
    amount.innerText = totalQuantity;
};

// Update cart quantity
listCartHtml.addEventListener('click', (event) => {
    let positionClick = event.target;
    if (positionClick.classList.contains('minus') || positionClick.classList.contains('plus')) {
        let product_id = positionClick.parentElement.parentElement.dataset.id;
        let type = positionClick.classList.contains('plus') ? 'plus' : 'minus';
        changeQuantity(product_id, type);
    }
});

const changeQuantity = (product_id, type) => {
    let positionItemInCart = carts.findIndex((value) => value.product_id == product_id);
    if (positionItemInCart >= 0) {
        switch (type) {
            case 'plus':
                carts[positionItemInCart].quantity += 1;
                break;
            case 'minus':
                let valueChange = carts[positionItemInCart].quantity - 1;
                if (valueChange > 0) {
                    carts[positionItemInCart].quantity = valueChange;
                } else {
                    carts.splice(positionItemInCart, 1);
                }
                break;
        }
    }
    addCartToHtml();
    addCarttoMemory();
};

// Store cart in local storage
const addCarttoMemory = () => {
    localStorage.setItem('cart', JSON.stringify(carts));
};

// Initialize the application
const initApp = () => {
    fetch('products.json')
        .then(response => response.json())
        .then(data => {
            listProducts = data;
            const path = window.location.pathname;
            const page = path.split('/').pop().split('.').shift(); // Get page name without extension
            const categoryMapping = {
                'project-P2': 'householdSupplies',
                'project-P3': 'bags',
                'project-P4': 'cups',
                'project-P5': 'lunchBox',
                'project-P6': 'foodContainer',
                'project-P7': 'other'
            };
            const category = categoryMapping[page] || ''; // Default to empty if not found
            addDataToHtml(category);
            if (localStorage.getItem('cart')) {
                carts = JSON.parse(localStorage.getItem('cart'));
                addCartToHtml();
            }
        })
        .catch(error => console.error('Error fetching product data:', error));
};

initApp();
