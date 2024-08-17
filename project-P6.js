document.addEventListener('DOMContentLoaded', () => {
    const iconCart = document.querySelector('.icon-cart');
    const closeCart = document.querySelector('.close');
    const body = document.querySelector('body');
    const listProductHTML = document.querySelector('.listProduct');
    const listCartHtml = document.querySelector('.listCart');
    const amount = document.querySelector('.icon-cart span');
    const searchBar = document.getElementById('search-bar');
    const suggestionsList = document.getElementById('suggestions');
    let listProducts = [];
    let carts = [];
    let currentIndex = -1;

    const toggleCartVisibility = () => body.classList.toggle('showCart');
    iconCart.addEventListener('click', toggleCartVisibility);
    closeCart.addEventListener('click', toggleCartVisibility);

    const fetchProducts = async () => {
        try {
            const response = await fetch('products.json');
            const data = await response.json();
            listProducts = data;
            localStorage.setItem('listProducts', JSON.stringify(listProducts));
            updatePage();
            console.log(data);
            
        } catch (error) {
            console.error('Error fetching product data:', error);
        }
    };

    const updatePage = () => {
        const path = window.location.pathname;
        const page = path.split('/').pop().split('.').shift();
        const categoryMapping = {
            'project-P2': 'householdSupplies',
            'project-P3': 'bags',
            'project-P4': 'cups',
            'project-P5': 'lunchBox',
            'project-P6': 'foodContainer',
            'project-P7': 'other'
        };
        const category = categoryMapping[page] || '';
        addDataToHtml(category);
        if (localStorage.getItem('cart')) {
            carts = JSON.parse(localStorage.getItem('cart'));
            updateCartHtml();
        }
    };

    const addDataToHtml = (category = '') => {
        listProductHTML.innerHTML = '';
        if (listProducts.length > 0) {
            const query = searchBar.value.toLowerCase();
            const filteredProducts = listProducts.filter(product => {
                const matchesSearch = !query || product.name.toLowerCase().includes(query);
                return category ? product.category === category && matchesSearch : matchesSearch;
            });

            filteredProducts.forEach(product => {
                const newProduct = document.createElement('div');
                newProduct.classList.add('item');
                newProduct.id = `item-${product.id}`;
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

    const addToCart = (productId) => {
        const existingProduct = carts.find(cart => cart.product_id === productId);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            carts.push({ product_id: productId, quantity: 1 });
        }
        updateCartHtml();
        localStorage.setItem('cart', JSON.stringify(carts));
    };

    const updateCartHtml = () => {
        listCartHtml.innerHTML = '';
        let totalQuantity = 0;
        let totalPrice = 0;

        carts.forEach(cart => {
            totalQuantity += cart.quantity;
            const product = listProducts.find(p => p.id === cart.product_id);
            if (product) {
                const itemTotalPrice = product.price * cart.quantity;
                totalPrice += itemTotalPrice;

                const newCartItem = document.createElement('div');
                newCartItem.classList.add('item');
                newCartItem.dataset.id = cart.product_id;
                newCartItem.innerHTML = `
                    <div class="image"><img src="${product.image}" alt="${product.name}"></div>
                    <div class="name">${product.name}</div>
                    <div class="itemTotalPrice">$${itemTotalPrice.toFixed(2)}</div>
                    <div class="quantity">
                        <span class="minus">-</span>
                        <span>${cart.quantity}</span>
                        <span class="plus">+</span>
                    </div>
                `;
                listCartHtml.appendChild(newCartItem);
            }
        });

        amount.innerText = totalQuantity;
        document.querySelector('.totalPriceContainer .totalPrice').innerText = `$${totalPrice.toFixed(2)}`;
    };

    const handleCartQuantityChange = (productId, type) => {
        const cartItem = carts.find(cart => cart.product_id === productId);
        if (cartItem) {
            if (type === 'plus') {
                cartItem.quantity += 1;
            } else if (type === 'minus') {
                cartItem.quantity -= 1;
                if (cartItem.quantity <= 0) {
                    carts = carts.filter(cart => cart.product_id !== productId);
                }
            }
            updateCartHtml();
            localStorage.setItem('cart', JSON.stringify(carts));
        }
    };

    const handleSearchInput = () => {
        const query = searchBar.value.toLowerCase();
        if (query) {
            const suggestions = listProducts.filter(product => product.name.toLowerCase().includes(query));
            displaySuggestions(suggestions);
        } else {
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
            currentIndex = -1;
        }
    };

    const displaySuggestions = (suggestions) => {
        suggestionsList.innerHTML = '';
        if (suggestions.length > 0) {
            suggestionsList.style.display = 'block';
            suggestions.forEach((product, index) => {
                const suggestionItem = document.createElement('div');
                suggestionItem.textContent = product.name;
                suggestionItem.dataset.id = product.id;
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.addEventListener('click', () => {
                    searchBar.value = product.name;
                    suggestionsList.innerHTML = '';
                    suggestionsList.style.display = 'none';
                    redirectToProductPage(product.id);
                    currentIndex = -1;
                });
                suggestionsList.appendChild(suggestionItem);
            });
        } else {
            suggestionsList.style.display = 'none';
            currentIndex = -1;
        }
    };

    const handleSearchKeyDown = (event) => {
        const suggestions = Array.from(suggestionsList.querySelectorAll('.suggestion-item'));
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (currentIndex < suggestions.length - 1) {
                currentIndex++;
                updateSuggestionFocus(suggestions);
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                updateSuggestionFocus(suggestions);
            }
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (currentIndex >= 0 && currentIndex < suggestions.length) {
                const selectedProductId = suggestions[currentIndex].dataset.id;
                redirectToProductPage(parseInt(selectedProductId, 10));
            }
        }
    };

    const updateSuggestionFocus = (suggestions) => {
        suggestions.forEach((item, index) => {
            item.classList.remove('highlight');
            if (index === currentIndex) {
                item.classList.add('highlight');
                item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    };

    const redirectToProductPage = (productId) => {
        const product = listProducts.find(p => p.id === productId);
        if (product) {
            const categoryMapping = {
                'householdSupplies': 'project-P2.html',
                'bags': 'project-P3.html',
                'cups': 'project-P4.html',
                'lunchBox': 'project-P5.html',
                'foodContainer': 'project-P6.html',
                'other': 'project-P7.html'
            };
            const category = product.category;
            const page = categoryMapping[category];
            if (page) {
                const url = new URL(page, window.location.origin);
                url.hash = `item-${productId}`;
                window.location.href = url.href;
                
                window.addEventListener('load', () => {
                    setTimeout(() => {
                        const element = document.getElementById(`item-${productId}`);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500);
                });
            }
        }
    };

    const handleCartButtonClick = (event) => {
        if (event.target.classList.contains('addCart')) {
            const productId = event.target.parentElement.dataset.id;
            addToCart(productId);
        }
    };

    const handleCartQuantityChangeClick = (event) => {
        if (event.target.classList.contains('minus') || event.target.classList.contains('plus')) {
            const productId = event.target.parentElement.parentElement.dataset.id;
            const type = event.target.classList.contains('plus') ? 'plus' : 'minus';
            handleCartQuantityChange(productId, type);
        }
    };

    const handleCheckoutClick = () => {
        window.location.href = 'project-D.html';
    };

    searchBar.addEventListener('input', handleSearchInput);
    searchBar.addEventListener('keydown', handleSearchKeyDown);
    listProductHTML.addEventListener('click', handleCartButtonClick);
    listCartHtml.addEventListener('click', handleCartQuantityChangeClick);

    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckoutClick);
    }

    const initApp = () => {
        const storedProducts = localStorage.getItem('listProducts');
        if (storedProducts) {
            listProducts = JSON.parse(storedProducts);
            updatePage();
        } else {
            fetchProducts();
        }
    };

    initApp();
});
