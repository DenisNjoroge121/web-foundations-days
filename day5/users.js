
const loadButton = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const status = document.getElementById("status");
const usersList = document.getElementById("users-list");

const apiUrl = "https://jsonplaceholder.typicode.com/users";

let users = [];


/* Fetch users from the API */

async function loadUsers() {
    loadButton.disabled = true;
    status.textContent = "Loading users...";
    usersList.replaceChildren();

    try {
        const response = await fetch(apiUrl);

        // Check whether the request was successful
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        // Convert the response into JavaScript data
        users = await response.json();

        // Render all users initially
        renderUsers(users);

        status.textContent = `Successfully loaded ${users.length} users.`;
    } catch (error) {
        users = [];
        usersList.replaceChildren();

        status.textContent =
            "Unable to load users. Please check your connection and try again.";

        console.error("Error loading users:", error);
    } finally {
        // Re-enable the button whether the request succeeds or fails
        loadButton.disabled = false;
    }
}


/* Display a list of users */

function renderUsers(list) {
    usersList.replaceChildren();

    if (list.length === 0) {
        status.textContent = "No users match your filter.";
        return;
    }

    list.forEach(function(user) {
        const listItem = document.createElement("li");

        const name = document.createElement("h2");
        name.textContent = user.name;

        const email = document.createElement("p");
        email.textContent = `Email: ${user.email}`;

        const city = document.createElement("p");
        city.textContent = `City: ${user.address.city}`;

        const company = document.createElement("p");
        company.textContent = `Company: ${user.company.name}`;

        listItem.append(
            name,
            email,
            city,
            company
        );

        usersList.appendChild(listItem);
    });
}


/* Load users when the button is clicked */

loadButton.addEventListener("click", loadUsers);


/* Filter the existing users without another API request */

filterInput.addEventListener("input", function() {
    const searchText = filterInput.value.trim().toLowerCase();

    const filteredUsers = users.filter(function(user) {
        return user.name.toLowerCase().includes(searchText);
    });

    if (users.length === 0) {
        status.textContent = "Click 'Load Users' to get started.";
        return;
    }

    if (filteredUsers.length === 0) {
        renderUsers(filteredUsers);
        return;
    }

    renderUsers(filteredUsers);

    status.textContent =
        `Showing ${filteredUsers.length} of ${users.length} users.`;
});
