document.addEventListener("DOMContentLoaded", function() {
    
    const baseURL = 'http://localhost:3000/films/';

    fetchMovieDetails(1);
    fetchAllMoviesMenu();

    document.getElementById("buyTicket").addEventListener("click", function() {
        const currentMovieId = document.getElementById("movieDetails").dataset.id;
        buyTicket(currentMovieId);
    });

    function fetchMovieDetails(id) {
        fetch(`${baseURL}${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(movie => {
            const movieDetailsDiv = document.getElementById("movieDetails");
            movieDetailsDiv.dataset.id = movie.id;
            movieDetailsDiv.innerHTML = `
                <img src="${movie.poster}" alt="${movie.title} poster" class="images">
                <h3>${movie.title}</h3>
                <p>Runtime: ${movie.runtime} minutes</p>
                <p>Showtime: ${movie.showtime}</p>
                <p>Available Tickets: ${movie.capacity - movie.tickets_sold}</p>
                <p>Description: ${movie.description}</p>
            `;
            updateBuyTicketButton(movie.capacity, movie.tickets_sold);
        })
        .catch(error => console.error('Error fetching movie details:', error));
    }

    function fetchAllMoviesMenu() {
        fetch(`${baseURL}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(movies => {
            const filmsList = document.getElementById("movies");
            filmsList.innerHTML = movies.map(movie => `
                <li class="film item ${movie.capacity - movie.tickets_sold === 0 ? 'sold-out' : ''}"
                    data-id="${movie.id}">
                    ${movie.title}
                </li>
            `).join('');
            attachMovieClickEvents();
        })
        .catch(error => console.error('Error fetching movies menu:', error));
    }

    function attachMovieClickEvents() {
        const movieItems = document.querySelectorAll(".film.item");
        movieItems.forEach(item => {
            item.addEventListener("click", function() {
                const movieId = this.dataset.id;
                fetchMovieDetails(movieId);
            });
        });
    }

    function buyTicket(movieId) {
        fetch(`${baseURL}${movieId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(movie => {
            if (movie.tickets_sold < movie.capacity) {
                const updatedTicketsSold = movie.tickets_sold + 1;
                return fetch(`${baseURL}${movieId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tickets_sold: updatedTicketsSold
                    })
                });
            } else {
                throw new Error('Tickets are sold out!');
            }
        })
        .then(() => {
            fetchMovieDetails(movieId);
            fetchAllMoviesMenu();
        })
        .catch(error => console.error('Error buying ticket:', error));
    }

    function updateBuyTicketButton(capacity, ticketsSold) {
        const buyTicketButton = document.getElementById("buyTicket");
        if (capacity - ticketsSold === 0) {
            buyTicketButton.textContent = "Sold Out";
            buyTicketButton.disabled = true;
        } else {
            buyTicketButton.textContent = "Buy Ticket";
            buyTicketButton.disabled = false;
        }
    }
});
