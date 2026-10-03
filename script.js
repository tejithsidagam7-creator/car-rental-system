let selectedCar = "";
let selectedPrice = 0;

function scrollToCars() {
    document.getElementById("cars").scrollIntoView({ behavior: "smooth" });
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
    document.getElementById("carName").innerHTML = `${car} <small class="booking-rate">· $${price} / day</small>`;
    document.getElementById("bookingModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeBooking() {
    document.getElementById("bookingModal").style.display = "none";
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
    document.getElementById("bookingMessage").innerHTML = `Reservation confirmed for ${selectedCar}. ${days} day(s) · Total $${total}.`;
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
    document.getElementById("bookingMessage").innerHTML = `Reservation confirmed for ${selected[0]}. ${days} day(s) · Total $${days * selected[1]}.`;
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
    document.getElementById("loginModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeLogin() {
    document.getElementById("loginModal").style.display = "none";
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

window.onclick = function(event) {
    if (event.target === document.getElementById("bookingModal")) closeBooking();
    if (event.target === document.getElementById("loginModal")) closeLogin();
};

selectCarFromUrl();
