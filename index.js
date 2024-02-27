const apiKey = "1ab8b687ee2cc0ecc4f0a847f38fcdac";
const apiEndpoint = "https://api.themoviedb.org/3";
const imgPath = "https://image.tmdb.org/t/p/original";

const apiPaths = {
    fetchAllCategories: `${apiEndpoint}/genre/movie/list?api_key=${apiKey}`,
    fetchMoviesList: (id) => `${apiEndpoint}/discover/movie?api_key=${apiKey}&with_genres=${id}`,
    fetchTrending: `${apiEndpoint}/trending/all/day?api_key=${apiKey}&language=en-US`
    // fetchMovieById: `${apiEndpoint}/movie/${movieId}?api_key=${apiKey}`
}

function init() {
    fetchTrendingMovies();
    fetchAndBuildAllSections();
}

function fetchTrendingMovies() {
    FetchandBuildMovieSection(apiPaths.fetchTrending, "Trending Now").then(list => {
        const randomIndex = parseInt(Math.random() * list.length);
        buildBannerSection(list[randomIndex]);
    }).catch(err => {
        console.error(err);
    });
}

function buildBannerSection(movie) {
    const bannerCont = document.getElementById("banner-section");
    bannerCont.style.backgroundImage = `url('${imgPath}${movie.backdrop_path}')`;
    const div = document.createElement('div')
    div.innerHTML = ` 
            <div class="banner-container container">
                <h2 class="banner__title">${movie.title}</h2>
                <p class="banner__info">Released - ${movie.release_date}</p>
                <p class="banner__overview">${movie.overview.slice(0, 300)}</p>
                <div class="action-buttons-cont">
                    <button class="action-button">Play</button>
                    <button class="action-button">More Info</button>
                </div>
            </div>
            `
    bannerCont.append(div);
}

async function fetchAndBuildAllSections() {
    try {
        const res = await fetch(apiPaths.fetchAllCategories);
        const response = await res.json();
        const catagories = response.genres;

        if (Array.isArray(catagories)) {
            catagories.forEach(catagory => {
                FetchandBuildMovieSection(apiPaths.fetchMoviesList(catagory.id), catagory);
            })
        }
    } catch (error) {
        console.error(error);
    }
}

async function FetchandBuildMovieSection(fetchURL, catagory) {
    // console.log(fetchURL, catagory);
    try {
        const res = await fetch(fetchURL);
        const response = await res.json();
        // console.log(response.results);
        const movies = response.results;
        if (Array.isArray(movies)) {
            buildMoviesSection(movies, catagory.name);
        }
        return res, movies
    } catch (error) {
        console.error(error);
    }
}

async function buildMoviesSection(list, catagoryName) {
    const moviesCont = document.getElementById('movies-cont');

    const moviesListHTML = list.map(item => {
        return `
        <img data-movie-Id="${item.id}" class="movie-item" src="${imgPath}${item.backdrop_path}" alt="${item.title}" />
        `
        ;
    }).join(' ');

    const moviesSectionHTML = `
    <h2 class="movie-section-heading">${(catagoryName)} <span class="explore-nudge">Explore All</span></h2>
    <div class="movies-row">
        ${moviesListHTML}
    </div>
    `
    const div = document.createElement('div');
    div.className = "movies-section";
    div.innerHTML = moviesSectionHTML;

    // append html into movie container
    moviesCont.append(div);

    // Add event listener to each movie row image
    const movieImages = div.querySelectorAll('.movie-item');
    movieImages.forEach(image => {
        image.addEventListener('click', async () => {
            const movieId = image.dataset.movieId; // Fetch movie ID
        if (movieId) { // Ensure movie ID is available
            fetchandShowMovieInfo(movieId);
        }
        });
    });
}

async function fetchandShowMovieInfo(movieId){
    const movieDetailsURL = `${apiEndpoint}/movie/${movieId}?api_key=${apiKey}`;
    try {
        document.getElementById("movie-detail-card").style.display = "inline-block"
        const response = await fetch(movieDetailsURL);
        const movieDetails = await response.json();
        // console.log('Movie details:', movieDetails);
        document.getElementById("movie-detail-card").innerHTML = `
            <div class="movie-detail-container">
                <div class="card__playbtn">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                    <circle cx="50" cy="50" r="45" fill="green"/>
                    <polygon points="35,25 75,50 35,75" fill="black"/>
                    </svg>
                </div>
                <div class="cross-btn" id="crossBtn"></div>
                <img class="card__img" src="${imgPath}${movieDetails.backdrop_path}" alt="${movieDetails.title}">
                <h3 class="card__title">${movieDetails.title}</h3>
                <h4 class="card__released">Released on ${movieDetails.release_date}</h4>
                <p class="card__overview">${movieDetails.overview}</p>
            </div>
        `
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
            
    document.getElementById('crossBtn').addEventListener("click", ()=>{
        document.getElementById('movie-detail-card').style.display = "none";
    })
}

init();