import { catagorMovie, movieListPromise } from "../../data/movie-list.js";
import { randomFilm } from "./button.js";
import { randomContinute } from "./utils-content.js";
import { randomIDMb } from "./utils-content.js";
// 2 đối số là list movie muốn duyệt, và tên list đó
function renderListMovie(movies, titleList) {
  let listHTML = '';
  const movieLimited = titleList === '.js-movie-list-random'
    ? movies.slice(0, 12)
    : movies.slice(0, 20)
  movieLimited.forEach((movie) => {
    listHTML += `
      <div class="movie-box test">

        <div class="preview-box">
          <div class="thumb-preview-box">
            <img src="https://phimimg.com/${movie.thumb_url}">
            <div class="poster-preview-box">
              <img src="https://phimimg.com/${movie.poster_url}">
            </div>
          </div>
          <div class="content-preview-box">
            <div class="util-preview-1"><p>${movie.name}</p></div>
            <div class="util-preview-2"><p>${movie.origin_name}</p></div>
           
            <div class="util-preview-3">${movie.quality}</div>
            <div class="util-preview-4">${movie.year}</div>
            <div class="util-preview-5">IMDb ${randomIDMb()}</div>
            <dov class="util-preview-6"><i class="fa-solid fa-heart" aria-hidden="true"></i></dov>

            <div class="util-preview-7">
              <a href="#"><i class="fa-solid fa-play play" aria-hidden="true"></i>  Xem ngay</a>
            </div>

            <div class="util-preview-8">
              <a href="preview.html">Thông tin phim<i class="fa-solid fa-angle-right"></i></a>
            </div>
          </div>
        </div>
      
        <img src="https://phimimg.com/${movie.poster_url}" alt="" class="pposter movie">
        <div class="content-name-movie">
          <p>${movie.name}</p>
          <p>${movie.origin_name}</p>
        </div>
      </div>
    ` 
  });
  
  const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = listHTML;
  }
}

function renderListMovieSingle(movies, titleList) {
  let html = '';
  const movieLimited = movies.slice(0, 16);
  movieLimited.forEach((movie) => {
    html+= `
      <div class="movie-single-box">
        
        <img src="https://phimimg.com/${movie.poster_url}">
        <div class="content-name-movie">
          <p>${movie.name}</p>
          <p>${movie.origin_name}</p>
        </div>
      </div>
    `
  })
  const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = html;
  }
}

function renderListMovieContinute(movies, titleList) {
  let html = '';
  const movieLimited = movies.slice(0, 6);
  movieLimited.forEach(movie => {
    html += `
      <div class="movie-continute-box">
        <img src="https://phimimg.com/${movie.poster_url}">
        <p>${randomContinute(movie.type, movie.episode_total)}</p>
      </div>
    `
  })
  const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = html;
  }
}


// Hàm render tất cả
function renderAllLists() {
  renderListMovie(catagorMovie.korea.series, '.js-movie-list-korea');
  renderListMovie(catagorMovie.china.series, '.js-movie-list-china');
  renderListMovie(catagorMovie.japan.anime, '.js-movie-list-japan');
  randomFilm(catagorMovie.full, renderListMovie, '.js-movie-list-random');
  renderListMovieSingle(catagorMovie.korea.single, '.js-movie-list-single-korea');
  renderListMovieSingle(catagorMovie.auMy.single, '.js-movie-list-single-auMy');
  renderListMovieContinute(catagorMovie.continute, '.js-movie-list-continute');
}

//load từ biến moviePromise (không trực tiếp từ loadMoviesFetch)
movieListPromise.then(() => {
  renderAllLists();
  console.log(' Initial render complete');
});

// Listen for movie updates và re-render
window.addEventListener('moviesUpdated', (event) => {
  console.log('Movies updated, re-rendering...');
  renderAllLists();
});

// Export để có thể gọi manual
export { renderListMovie, renderAllLists };