document.addEventListener("DOMContentLoaded", function () {
    var currentURL = window.location.href;

    // Load different PX tags for different pages
    let pxTag;
    if (currentURL.includes("index.html")) {
        pxTag = "AP-HMVJXVOOAUYX-2";  // PX Tag for login page
    } else if (currentURL.includes("product.html")) {
        pxTag = "AP-HMVJXVOOAUYX-2";  // PX Tag for product page
    } else if (currentURL.includes("cart.html")) {
        pxTag = "AP-FZEPRMBRBNYU-2";  // PX Tag for cart page
    }

    if (pxTag) {
        (function(n, t, a, e, co) {
            var i = "aptrinsic";
            n[i] = n[i] || function() {
                (n[i].q = n[i].q || []).push(arguments);
            }, n[i].p = e, n[i].c = co;
            var r = t.createElement("script");
            r.async = !0, r.src = a + "?a=" + e;
            var c = t.getElementsByTagName("script")[0];
            c.parentNode.insertBefore(r, c);
            console.log(pxTag);

            // Call the identify method after PX script loads
            r.onload = function() {
                console.log("PX script loaded, proceeding with identify.");
                
                let username = localStorage.getItem("loggedInUser");
                if (username) {
                    aptrinsic("identify", {
                        "id": username, // User ID
                        "email": username + "@example.com"
                    }, {
                        "id": "IBM", // Account ID
                        "name": "International Business Machine"
                    });
                }
            };

        })(window, document, "https://web-sdk.aptrinsic.com/api/aptrinsic.js", pxTag);
    }

    // Ensure user is logged in for product/cart pages
    if (document.querySelector('.product-container') || document.querySelector('.cart-container')) {
        if (!localStorage.getItem('loggedInUser')) {
            window.location.href = 'index.html';
        }
    }

    // Login Functionality
    let loginForm = document.querySelector("#login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            let usernameInput = document.querySelector("#username");
            if (!usernameInput || usernameInput.value.trim() === "") {
                alert("Please enter a username.");
                return;
            }

            let username = usernameInput.value.trim();
            localStorage.setItem("loggedInUser", username);

            // Redirect to product page after login
            window.location.href = "product.html";
        });
    }

    // Product Page - List Products
    const products = [
        { id: 1, name: "Mountain Bike", price: 299.99 },
        { id: 2, name: "Road Bike", price: 349.99 },
        { id: 3, name: "Hybrid Bike", price: 279.99 },
        { id: 4, name: "Electric Bike", price: 599.99 }
    ];

    if (document.querySelector('.product-container')) {
        const productContainer = document.querySelector('.product-container');
        products.forEach(product => {
            let productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>`;
            productContainer.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function () {
                let productId = this.getAttribute('data-id');
                let selectedProduct = products.find(p => p.id == productId);
                let cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.push(selectedProduct);
                localStorage.setItem('cart', JSON.stringify(cart));
                alert(`${selectedProduct.name} added to cart!`);
            });
        });
    }

    // Navigate to Cart
    if (document.querySelector('#go-to-cart')) {
        document.querySelector('#go-to-cart').addEventListener('click', function () {
            window.location.href = 'cart.html';
        });
    }

    // Cart Page - Display Items and Track Separately in PX
    if (document.querySelector('#cart-items')) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartItemsContainer = document.querySelector('#cart-items');
        const totalPriceElement = document.querySelector('#total-price');

        function updateCartUI() {
            cartItemsContainer.innerHTML = '';
            let totalPrice = 0;
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<li>Your cart is empty.</li>';
            } else {
                cart.forEach((item, index) => {
                    let li = document.createElement('li');
                    li.innerHTML = `${item.name} - $${item.price.toFixed(2)}
                        <button class="remove-item" data-index="${index}">Remove</button>`;
                    cartItemsContainer.appendChild(li);
                    totalPrice += item.price;
                });
            }
            totalPriceElement.textContent = totalPrice.toFixed(2);
        }

        updateCartUI();

        cartItemsContainer.addEventListener('click', function (event) {
            if (event.target.classList.contains('remove-item')) {
                let index = event.target.getAttribute('data-index');
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
            }
        });

        document.querySelector('#clear-cart').addEventListener('click', function () {
            localStorage.removeItem('cart');
            cart = [];
            updateCartUI();
        });

        document.querySelector('#checkout').addEventListener('click', function () {
            if (cart.length === 0) {
                alert('Your cart is empty.');
            } else {
                alert('Proceeding to checkout...');
                localStorage.removeItem('cart');
                window.location.href = 'product.html';
            }
        });

        // Track cart interactions separately in PX
        if (typeof aptrinsic !== "undefined") {
            aptrinsic('track', 'CartPageVisited', { itemsInCart: cart.length });
        }
    }

    // Logout Functionality
    let logoutButton = document.querySelector("#logout-button");
    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            localStorage.removeItem("loggedInUser");
            window.location.href = "index.html";
        });
    }
});
