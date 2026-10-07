let selectedCar = "";
let selectedPrice = 0;

const STORAGE_KEYS = {
    users: "wayfare_users",
    cars: "wayfare_cars",
    adminSession: "wayfare_admin_session"
};

const defaultCars = [
    {
        id: 1,
        name: "Polestar 2",
        price: 84,
        category: "Electric",
        seats: 5,
        featured: true,
        image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=85"
    },
    {
        id: 2,
        name: "Mini Cooper",
        price: 56,
        category: "Compact",
        seats: 4,
        featured: false,
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=85"
    },
    {
        id: 3,
        name: "Range Rover Evoque",
        price: 112,
        category: "SUV",
        seats: 5,
        featured: false,
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85"
    }
];

const defaultUsers = [{
    id: 1,
    name: "Administrator",
    username: "admin",
    email: "admin@wayfare.com",
    password: "admin1234",
    role: "admin"
}];

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
}

function readStorageList(key, fallback) {
    try {
        const savedValue = localStorage.getItem(key);
        if (!savedValue) {
            return fallback;
        }
        const parsedValue = JSON.parse(savedValue);
        return Array.isArray(parsedValue) ? parsedValue : fallback;
    } catch (error) {
        return fallback;
    }
}

function writeStorageList(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function initializeLocalStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.users)) {
        writeStorageList(STORAGE_KEYS.users, defaultUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.cars)) {
        writeStorageList(STORAGE_KEYS.cars, defaultCars);
    }
    if (localStorage.getItem(STORAGE_KEYS.adminSession) !== "true" && localStorage.getItem(STORAGE_KEYS.adminSession) !== "false") {
        localStorage.setItem(STORAGE_KEYS.adminSession, "false");
    }
}

function getCurrentCars() {
    return readStorageList(STORAGE_KEYS.cars, defaultCars);
}

function renderCarsToPage() {
    const containers = document.querySelectorAll(".cars-container");
    if (!containers.length) return;

    const cars = getCurrentCars();

    containers.forEach((container) => {
        if (!cars.length) {
            container.innerHTML = `
                <article class="car-card empty-state">
                    <div class="car-details">
                        <h3>No cars available</h3>
                        <p>Add vehicles from the admin panel to populate this section.</p>
                    </div>
                </article>
            `;
            return;
        }

        container.innerHTML = cars.map((car) => {
            const price = Number(car.price) || 0;
            return `
                <article class="car-card ${car.featured ? "featured-card" : ""}">
                    <div class="car-img">
                        <img src="${escapeAttribute(car.image || "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=85")}" alt="${escapeAttribute(car.name)}">
                    </div>
                    <div class="car-details">
                        <div class="card-top">
                            <span class="tag ${car.featured ? "" : "muted"}">${escapeHtml(car.category || "Available")}</span>
                            <span class="availability">● Available</span>
                        </div>
                        <h3>${escapeHtml(car.name)}</h3>
                        <p>${escapeHtml(car.category || "Vehicle")} <span>·</span> ${Number(car.seats) || 4} seats</p>
                        <div class="card-bottom">
                            <div class="price">$${price} <small>/ day</small></div>
                            <button class="round-button" type="button" onclick="openBooking('${escapeAttribute(car.name).replace(/'/g, "\\'")}', ${price})" aria-label="Book ${escapeAttribute(car.name)}">↗</button>
                        </div>
                    </div>
                </article>
            `;
        }).join("");
    });
}

function scrollToCars() {
    const fleetSection = document.getElementById("cars");
    if (fleetSection) {
        fleetSection.scrollIntoView({ behavior: "smooth" });
    }
}

function searchCars() {
    const location = document.getElementById("location").value.trim();
    const pickup = document.getElementById("pickupDate").value;
    const returnDate = document.getElementById("returnDate").value;
    if (!location || !pickup || !returnDate) {
        alert("Add a location and both rental dates to search.");
        return;
    }
    if (returnDate <= pickup) {
        alert("Your return date must be after your pick-up date.");
        return;
    }
    scrollToCars();
}

function openBooking(car, price) {
    selectedCar = car;
    selectedPrice = price;
    const carName = document.getElementById("carName");
    const bookingModal = document.getElementById("bookingModal");
    if (carName) {
        carName.innerHTML = `${car} <small class="booking-rate">· $${price} / day</small>`;
    }
    if (bookingModal) {
        bookingModal.style.display = "flex";
    }
    document.body.style.overflow = "hidden";
}

function closeBooking() {
    const bookingModal = document.getElementById("bookingModal");
    if (bookingModal) {
        bookingModal.style.display = "none";
    }
    document.body.style.overflow = "";
}

function confirmBooking() {
    const fields = ["customerName", "customerEmail", "customerPhone", "bookPickup", "bookReturn"];
    const values = fields.map((id) => document.getElementById(id).value.trim());
    if (values.some((value) => !value)) {
        alert("Please complete all booking details.");
        return;
    }
    const start = new Date(values[3]);
    const end = new Date(values[4]);
    if (end <= start) {
        alert("Your return date must be after your pick-up date.");
        return;
    }
    const days = Math.ceil((end - start) / 86400000);
    const total = days * selectedPrice;
    const bookingMessage = document.getElementById("bookingMessage");
    if (bookingMessage) {
        bookingMessage.innerHTML = `Reservation confirmed for ${selectedCar}. ${days} day(s) · Total $${total}.`;
    }
}

function confirmPageBooking() {
    const fields = ["customerName", "customerEmail", "customerPhone", "location", "bookPickup", "bookReturn"];
    const values = fields.map((id) => document.getElementById(id).value.trim());
    if (values.some((value) => !value)) {
        alert("Please complete all booking details.");
        return;
    }
    const start = new Date(values[4]);
    const end = new Date(values[5]);
    if (end <= start) {
        alert("Your return date must be after your pick-up date.");
        return;
    }
    const cars = {
        polestar: ["Polestar 2", 84],
        mini: ["Mini Cooper", 56],
        rover: ["Range Rover Evoque", 112]
    };
    const selected = cars[document.getElementById("carSelect").value];
    const days = Math.ceil((end - start) / 86400000);
    const bookingMessage = document.getElementById("bookingMessage");
    if (bookingMessage) {
        bookingMessage.innerHTML = `Reservation confirmed for ${selected[0]}. ${days} day(s) · Total $${days * selected[1]}.`;
    }
}

function selectCarFromUrl() {
    const select = document.getElementById("carSelect");
    if (!select) return;
    const car = new URLSearchParams(window.location.search).get("car");
    if (car && [...select.options].some((option) => option.value === car)) select.value = car;
}

function toggleNavigation() {
    const navigation = document.querySelector(".site-header nav");
    const toggle = document.querySelector(".menu-toggle");
    if (!navigation || !toggle) return;
    const isOpen = navigation.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
}

function openLogin() {
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.style.display = "flex";
    }
    document.body.style.overflow = "hidden";
}

function closeLogin() {
    const loginModal = document.getElementById("loginModal");
    if (loginModal) {
        loginModal.style.display = "none";
    }
    document.body.style.overflow = "";
}

function login() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }
    document.getElementById("loginMessage").textContent = "You're signed in. Welcome back.";
}

function syncAdminPanelState() {
    const loginCard = document.getElementById("adminLoginCard");
    const dashboard = document.getElementById("adminDashboard");
    if (!loginCard || !dashboard) return;

    const isLoggedIn = localStorage.getItem(STORAGE_KEYS.adminSession) === "true";
    loginCard.classList.toggle("hidden", isLoggedIn);
    dashboard.classList.toggle("hidden", !isLoggedIn);
}

function renderAdminUsers() {
    const userList = document.getElementById("userList");
    if (!userList) return;

    const users = readStorageList(STORAGE_KEYS.users, defaultUsers);
    userList.innerHTML = users.map((user) => {
        const isProtectedAdmin = user.username === "admin";
        return `
            <li class="data-item">
                <div>
                    <strong>${escapeHtml(user.name || user.username)}</strong>
                    <span>${escapeHtml(user.email || user.username)}</span>
                </div>
                <button type="button" class="delete-button" data-user-id="${user.id}" ${isProtectedAdmin ? "disabled" : ""}>${isProtectedAdmin ? "Protected" : "Delete"}</button>
            </li>
        `;
    }).join("");
}

function renderAdminCars() {
    const carList = document.getElementById("carList");
    if (!carList) return;

    const cars = getCurrentCars();
    carList.innerHTML = cars.map((car) => `
        <li class="data-item">
            <div>
                <strong>${escapeHtml(car.name)}</strong>
                <span>$${Number(car.price) || 0} / day</span>
            </div>
            <button type="button" class="delete-button" data-car-id="${car.id}">Delete</button>
        </li>
    `).join("");
}

function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;
    const loginMessage = document.getElementById("adminLoginMessage");

    if (username === "admin" && password === "admin1234") {
        localStorage.setItem(STORAGE_KEYS.adminSession, "true");
        syncAdminPanelState();
        renderAdminUsers();
        renderAdminCars();
        return;
    }

    if (loginMessage) {
        loginMessage.textContent = "Invalid credentials. Use admin / admin1234.";
    }
}

function logoutAdmin() {
    localStorage.setItem(STORAGE_KEYS.adminSession, "false");
    syncAdminPanelState();
    const loginForm = document.getElementById("adminLoginForm");
    if (loginForm) {
        loginForm.reset();
    }
}

function addUser(event) {
    event.preventDefault();
    const userName = document.getElementById("userName").value.trim();
    const userUsername = document.getElementById("userUsername").value.trim();
    const userEmail = document.getElementById("userEmail").value.trim();
    const userPassword = document.getElementById("userPassword").value.trim();

    if (!userName || !userUsername || !userEmail || !userPassword) {
        alert("Please complete all user fields before adding a customer.");
        return;
    }

    const users = readStorageList(STORAGE_KEYS.users, defaultUsers);
    const duplicateUser = users.some((user) => user.username.toLowerCase() === userUsername.toLowerCase() || user.email.toLowerCase() === userEmail.toLowerCase());

    if (duplicateUser) {
        alert("A user with that username or email already exists.");
        return;
    }

    users.push({
        id: Date.now(),
        name: userName,
        username: userUsername,
        email: userEmail,
        password: userPassword,
        role: "user"
    });

    writeStorageList(STORAGE_KEYS.users, users);
    document.getElementById("userForm").reset();
    renderAdminUsers();
}

function deleteUser(userId) {
    const users = readStorageList(STORAGE_KEYS.users, defaultUsers);
    const targetUser = users.find((user) => Number(user.id) === Number(userId));

    if (!targetUser || targetUser.username === "admin") {
        return;
    }

    const remainingUsers = users.filter((user) => Number(user.id) !== Number(userId));
    writeStorageList(STORAGE_KEYS.users, remainingUsers);
    renderAdminUsers();
}

function addCar(event) {
    event.preventDefault();
    const carName = document.getElementById("carNameInput").value.trim();
    const carPrice = Number(document.getElementById("carPrice").value);
    const carCategory = document.getElementById("carCategory").value.trim();
    const carSeats = Number(document.getElementById("carSeats").value);
    const carImage = document.getElementById("carImage").value.trim();

    if (!carName || !carCategory || !carPrice || !carSeats) {
        alert("Please complete all car fields before adding the vehicle.");
        return;
    }

    const cars = getCurrentCars();
    cars.push({
        id: Date.now(),
        name: carName,
        price: carPrice,
        category: carCategory,
        seats: carSeats,
        featured: false,
        image: carImage || "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=85"
    });

    writeStorageList(STORAGE_KEYS.cars, cars);
    document.getElementById("carForm").reset();
    renderAdminCars();
    renderCarsToPage();
}

function deleteCar(carId) {
    const cars = getCurrentCars();
    const remainingCars = cars.filter((car) => Number(car.id) !== Number(carId));
    writeStorageList(STORAGE_KEYS.cars, remainingCars);
    renderAdminCars();
    renderCarsToPage();
}

function resetDemoData() {
    writeStorageList(STORAGE_KEYS.users, defaultUsers);
    writeStorageList(STORAGE_KEYS.cars, defaultCars);
    renderAdminUsers();
    renderAdminCars();
    renderCarsToPage();
}

function initAdminPage() {
    const adminLoginForm = document.getElementById("adminLoginForm");
    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", handleAdminLogin);
    }

    const adminLogoutButton = document.getElementById("adminLogoutButton");
    if (adminLogoutButton) {
        adminLogoutButton.addEventListener("click", logoutAdmin);
    }

    const userForm = document.getElementById("userForm");
    if (userForm) {
        userForm.addEventListener("submit", addUser);
    }

    const carForm = document.getElementById("carForm");
    if (carForm) {
        carForm.addEventListener("submit", addCar);
    }

    const userList = document.getElementById("userList");
    if (userList) {
        userList.addEventListener("click", (event) => {
            if (event.target.matches("[data-user-id]")) {
                deleteUser(event.target.getAttribute("data-user-id"));
            }
        });
    }

    const carList = document.getElementById("carList");
    if (carList) {
        carList.addEventListener("click", (event) => {
            if (event.target.matches("[data-car-id]")) {
                deleteCar(event.target.getAttribute("data-car-id"));
            }
        });
    }

    const resetButton = document.getElementById("resetDemoData");
    if (resetButton) {
        resetButton.addEventListener("click", resetDemoData);
    }

    syncAdminPanelState();
    renderAdminUsers();
    renderAdminCars();
}

window.onclick = function(event) {
    const bookingModal = document.getElementById("bookingModal");
    const loginModal = document.getElementById("loginModal");
    if (event.target === bookingModal) closeBooking();
    if (event.target === loginModal) closeLogin();
};

initializeLocalStorage();
renderCarsToPage();
initAdminPage();
selectCarFromUrl();
