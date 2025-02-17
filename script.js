document.addEventListener("DOMContentLoaded", () => {
    const booksContainer = document.getElementById("books-container");
    const cartDropdown = document.getElementById("cart");
    const searchInput = document.getElementById("search");
    const cartToggle = document.getElementById("cartDropdown");
    let books = [];
    let cartItems = [];

    fetch("https://striveschool-api.herokuapp.com/books")
        .then(response => response.json())
        .then(data => {
            books = data;
            renderBooks(books);
        });

    function renderBooks(filteredBooks) {
        booksContainer.innerHTML = "";
        filteredBooks.forEach(book => {
            const bookCard = document.createElement("div");
            bookCard.className = "col-md-3 d-flex justify-content-center";
            bookCard.innerHTML = `
                <div class="card">
                    <img src="${book.img}" class="card-img-top" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">${book.price}€</p>
                        <button class="btn btn-add" onclick="addToCart(this, '${book.title}', ${book.price})">Aggiungi al carrello</button>
                    </div>
                </div>
            `;
            booksContainer.appendChild(bookCard);
        });
    }

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        const filteredBooks = books.filter(book => book.title.toLowerCase().includes(query));
        renderBooks(filteredBooks);
    });

    window.addToCart = (button, title, price) => {
        cartItems.push({ title, price });
        button.closest(".card").classList.add("added-to-cart");
        renderCart();
    };

    function renderCart() {
        cartDropdown.innerHTML = "";
        if (cartItems.length === 0) {
            cartDropdown.innerHTML = '<li><span class="dropdown-item">Il carrello è vuoto</span></li>';
            return;
        }
        cartItems.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "dropdown-item d-flex justify-content-between align-items-center";
            li.innerHTML = `${item.title} - ${item.price}€ <button class="btn btn-remove btn-sm" onclick="removeFromCart(${index})">Rimuovi</button>`;
            cartDropdown.appendChild(li);
        });
    }

    window.removeFromCart = (index) => {
        cartItems.splice(index, 1);
        renderCart();
    };

    cartToggle.addEventListener("click", () => {
        cartDropdown.classList.toggle("show");
    });
});
