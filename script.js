document.addEventListener('DOMContentLoaded', () => {
    // State management
    let books = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // DOM elements
    const booksListElement = document.getElementById('booksList');
    const searchInput = document.getElementById('searchInput');
    const cartItemsElement = document.getElementById('cartItems');
    const cartCountElement = document.getElementById('cartCount');
    const cartTotalElement = document.getElementById('cartTotal');
    const clearCartButton = document.getElementById('clearCart');
    const homePage = document.getElementById('homePage');
    const detailsPage = document.getElementById('detailsPage');
    const bookDetailsElement = document.getElementById('bookDetails');
    const homeLink = document.getElementById('homeLink');
    const cartNav = document.getElementById('cartNav');

    // Router function
    function handleRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const bookId = urlParams.get('id');

        if (bookId) {
            showDetailsPage(bookId);
        } else {
            showHomePage();
        }
    }

    // Show/Hide pages
    function showHomePage() {
        homePage.style.display = 'block';
        detailsPage.style.display = 'none';
        cartNav.style.display = 'flex';
        window.history.pushState({}, '', '/');
    }

    function showDetailsPage(bookId) {
        homePage.style.display = 'none';
        detailsPage.style.display = 'block';
        cartNav.style.display = 'none';
        loadBookDetails(bookId);
        window.history.pushState({}, '', `?id=${bookId}`);
    }

    // Fetch books from API
    async function fetchBooks() {
        try {
            booksListElement.classList.add('loading');
            const response = await fetch('https://striveschool-api.herokuapp.com/books');
            if (!response.ok) throw new Error('Failed to fetch books');
            books = await response.json();
            renderBooks(books);
        } catch (error) {
            console.error('Error fetching books:', error);
            booksListElement.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">Failed to load books. Please try again later.</div>
                </div>
            `;
        } finally {
            booksListElement.classList.remove('loading');
        }
    }

    // Load book details
    async function loadBookDetails(bookId) {
        try {
            const response = await fetch('https://striveschool-api.herokuapp.com/books');
            if (!response.ok) throw new Error('Failed to fetch books');

            const books = await response.json();
            const book = books.find(b => b.asin === bookId);

            if (!book) {
                bookDetailsElement.innerHTML = `
                    <div class="card-body">
                        <div class="alert alert-danger">Book not found</div>
                    </div>
                `;
                return;
            }

            bookDetailsElement.innerHTML = `
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${book.img}" class="img-fluid rounded-start" alt="${book.title}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h2 class="card-title">${book.title}</h2>
                            <p class="card-text">
                                <strong>Category:</strong> ${book.category || 'Not specified'}
                            </p>
                            <p class="card-text">
                                <strong>Price:</strong> $${book.price}
                            </p>
                            <p class="card-text">
                                <strong>ASIN:</strong> ${book.asin}
                            </p>
                            <button class="btn btn-primary" onclick="window.history.back()">Back to Books</button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error fetching book details:', error);
            bookDetailsElement.innerHTML = `
                <div class="card-body">
                    <div class="alert alert-danger">Failed to load book details. Please try again later.</div>
                </div>
            `;
        }
    }

    // Render books
    function renderBooks(booksToRender) {
        booksListElement.innerHTML = booksToRender.map(book => `
            <div class="col-md-6 col-lg-4">
                <div class="card book-card ${cart.some(item => item.id === book.asin) ? 'in-cart' : ''}">
                    <img src="${book.img}" class="card-img-top" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">$${book.price}</p>
                        <div class="d-flex gap-2">
                            <button class="btn btn-primary add-to-cart" data-id="${book.asin}"
                                ${cart.some(item => item.id === book.asin) ? 'disabled' : ''}>
                                ${cart.some(item => item.id === book.asin) ? 'In Cart' : 'Add to Cart'}
                            </button>
                            <button class="btn btn-info details-btn" data-id="${book.asin}">Details</button>
                            <button class="btn btn-secondary skip-book" data-id="${book.asin}">Skip</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render cart
    function renderCart() {
        cartItemsElement.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${item.title}</h6>
                        <small class="text-muted">$${item.price}</small>
                    </div>
                    <button class="btn btn-danger btn-sm remove-from-cart" data-id="${item.id}">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('') || '<p class="text-center">Your cart is empty</p>';

        cartCountElement.textContent = cart.length;
        cartTotalElement.textContent = `Total: $${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Event Listeners
    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showHomePage();
    });

    booksListElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart')) {
            const bookId = e.target.dataset.id;
            const book = books.find(b => b.asin === bookId);
            if (book && !cart.some(item => item.id === bookId)) {
                cart.push({
                    id: book.asin,
                    title: book.title,
                    price: book.price
                });
                renderCart();
                renderBooks(books);
            }
        }

        if (e.target.classList.contains('details-btn')) {
            const bookId = e.target.dataset.id;
            showDetailsPage(bookId);
        }

        if (e.target.classList.contains('skip-book')) {
            const bookId = e.target.dataset.id;
            const bookElement = e.target.closest('.col-md-6');
            if (bookElement) {
                bookElement.remove();
            }
        }
    });

    cartItemsElement.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-from-cart') || 
            e.target.parentElement.classList.contains('remove-from-cart')) {
            const bookId = e.target.closest('.remove-from-cart').dataset.id;
            cart = cart.filter(item => item.id !== bookId);
            renderCart();
            renderBooks(books);
        }
    });

    clearCartButton.addEventListener('click', () => {
        cart = [];
        renderCart();
        renderBooks(books);
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length >= 3) {
            const filteredBooks = books.filter(book => 
                book.title.toLowerCase().includes(searchTerm)
            );
            renderBooks(filteredBooks);
        } else if (searchTerm.length === 0) {
            renderBooks(books);
        }
    });

    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleRoute);

    // Initial setup
    handleRoute();
    fetchBooks();
    renderCart();
});