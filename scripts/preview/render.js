import { catagorMovie, movieListPromise } from "../../data/movie-list.js";

// 2 đối số là list movie muốn duyệt, và tên list đó

function renderListMovieRecommend(movie, titleList) {
  let html = '';
  const movieLimited = movie.slice(0, 5);
  movieLimited.forEach(movie => {
    html += `
      <div class="movie-recommend-box">
        <div class="poster-movie-recommend">
          <a href="../preview/${movie.slug}">
            <img src="https://phimimg.com/${movie.poster_url}">
          </a>
        </div>
        <div class="info-movie-recommend">
          <div class="name-movie-recommend">
            <p>${movie.name}</p>
            <p>${movie.origin_name}</p>
          </div>
          <div>
            <a href="../preview/${movie.slug}">Thông tin phim<i class="fa-solid fa-angle-right"></i></a>
          </div>
        </div>
      </div>
    `
  });
  document.querySelector(titleList)
    .innerHTML = html;
};

// Hàm render tất cả
function renderAllLists() {
  renderListMovieRecommend(catagorMovie.korea.series, '.js-movie-list-recommend');
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
export { renderAllLists };