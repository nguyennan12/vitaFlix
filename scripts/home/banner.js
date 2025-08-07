import { catagorMovie, movieListPromise } from "../../data/movie-list.js";
import { randomIDMb } from "./utils-content.js";

document.addEventListener("DOMContentLoaded", function () {
  movieListPromise.then(() => {
    renderCarousel(catagorMovie.favMovie);

    const firstMovie = catagorMovie.favMovie?.[0];
    if (firstMovie) {
      changeBanner(firstMovie);
    }

    renderBanner();
  });
});

function renderBanner() {
  document.querySelectorAll('.js-carousel-item')
    .forEach(movies => {
      movies.addEventListener('click', () => {
        const movie = JSON.parse(decodeURIComponent(movies.dataset.movie));
        changeBanner(movie); 
      });
    })
}

function renderCarousel(movies) {
  let html = '';
  const movieList = movies;
  movieList.forEach((movie) => {
    html += `
      <div class="carousel-item js-carousel-item"
      data-movie="${encodeURIComponent(JSON.stringify(movie))}">
        <img src="https://phimimg.com/${movie.poster_url}">
      </div>  
    `
  });
  document.querySelector('.js-carousel')
    .innerHTML = html;
   requestAnimationFrame(() => {
    const elems = document.querySelectorAll('.js-carousel');
    M.Carousel.init(elems); // ✅ dùng init
  });
}


function renderContent(movies) {
  let html = '';
    html += `
      <div class="content active js-content">
        <div class="movie-title">
          <h2>${movies.name}</h2>
          <div>${movies.origin_name}</div>
        </div>
        
        <div class="button-info">
          <div class="IMDb-vote">
            IMDb ${randomIDMb()}
          </div>
          <div class="movie-quality">
            ${movies.quality}
          </div>
          <div class="movie-year">${movies.year}</div>
          <div class="movie-duration">Tập ${movies.episode_total}</div>
        </div>
        <div class="button-genre js-button-genre">
            
        </div>
        <p>${movies.content}</p>
        <div class="button-display">
          <button class="button-play">
              <a href="#"><i class="fa-solid fa-play play" aria-hidden="true"></i></a>
          </button>
          <div class="button-like">
            <a href="#"><i class="fa-solid fa-heart" aria-hidden="true"></i></a>
            <a href="#"><i class="fa-solid fa-circle-info" aria-hidden="true"></i></a>
          </div>
        </div>
      </div>
    `
  document.querySelector('.js-content-box')
    .innerHTML = html;
}

function renderGenre(movies) {
  let html = '';
  const listGenre = movies.category.slice(0, 4);
  listGenre.forEach((genre) => {
    html += `<div>${genre.name}</div>`
  });
  document.querySelector('.js-button-genre')
    .innerHTML = html;
}

function changeBanner (movie) {

  const banner = document.querySelector('.js-banner');
  
  banner.style.background = `url("https://phimimg.com/${movie.thumb_url}")`;
  banner.style.backgroundSize = 'cover';
  banner.style.backgroundPosition = 'center'

  renderContent(movie);

  renderGenre(movie);

  /*
  contents.forEach((content) => {
    content.classList.remove('active');
    if(content.classList.contains(title)){
      content.classList.add('active');
    }
  });
  */
}
