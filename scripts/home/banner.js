import { catagorMovie, movieListPromise } from "../../data/movie-list.js";
import { randomIDMb } from "./utils-content.js";

// Expose to global for debugging
window.catagorMovie = catagorMovie;
window.movieListPromise = movieListPromise;

document.addEventListener("DOMContentLoaded", function () {
  
  movieListPromise.then(() => {
    
    // Kiểm tra dữ liệu favMovie
    if (!catagorMovie.favMovie || catagorMovie.favMovie.length === 0) {
      console.error('No favMovie data found, using fallback');
      
      // Fallback 1: Sử dụng phim từ Korea series
      if (catagorMovie.korea?.series && catagorMovie.korea.series.length > 0) {
        const fallbackMovies = catagorMovie.korea.series.slice(0, 5);
        renderCarousel(fallbackMovies);
        changeBanner(fallbackMovies[0]);
      }
      // Fallback 2: Sử dụng từ full list
      else if (catagorMovie.full && catagorMovie.full.length > 0) {
        const fallbackMovies = catagorMovie.full.slice(0, 5);
        console.log('Using full list as fallback:', fallbackMovies.length, 'movies');
        renderCarousel(fallbackMovies);
        changeBanner(fallbackMovies[0]);
      } else {
        console.error('No movie data available at all!');
        showBannerError();
        return;
      }
    } else {
      console.log('Using favMovie data:', catagorMovie.favMovie.length, 'movies');
      renderCarousel(catagorMovie.favMovie);
      const firstMovie = catagorMovie.favMovie[0];
      changeBanner(firstMovie);
    }

    renderBanner();
  }).catch(error => {
    console.error('Error in banner initialization:', error);
    showBannerError();
  });
});

// Hiển thị lỗi banner
function showBannerError() {
  const banner = document.querySelector('.js-banner');
  const contentBox = document.querySelector('.js-content-box');
  
  if (banner) {
    banner.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    banner.style.minHeight = '500px';
  }
  
  if (contentBox) {
    contentBox.innerHTML = `
      <div class="content active js-content">
        <div class="movie-title">
          <h2>VitaFlix</h2>
          <div>Đang tải dữ liệu phim...</div>
        </div>
        <p>Vui lòng chờ trong giây lát...</p>
      </div>
    `;
  }
}

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
  
  const carouselElement = document.querySelector('.js-carousel');
  if (carouselElement) {
    carouselElement.innerHTML = html;
    
    // Chờ DOM update và kiểm tra element tồn tại
    requestAnimationFrame(() => {
      // Kiểm tra jQuery và element có sẵn không
      if (typeof $ !== 'undefined' && carouselElement.children.length > 0) {
        try {
          // Kiểm tra element có clientWidth không
          if (carouselElement.clientWidth > 0) {
            $('.js-carousel').carousel();
          } else {
            // Chờ thêm một chút nếu element chưa có kích thước
            setTimeout(() => {
              if (carouselElement.clientWidth > 0) {
                $('.js-carousel').carousel();
              }
            }, 100);
          }
        } catch (error) {
          console.warn('Carousel initialization failed:', error);
        }
      }
    });
  }
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
  const contentBox = document.querySelector('.js-content-box');
  if (contentBox) {
    contentBox.innerHTML = html;
  }
}

function renderGenre(movies) {
  let html = '';
  const listGenre = movies.category.slice(0, 4);
  listGenre.forEach((genre) => {
    html += `<div>${genre.name}</div>`
  });
  const genreElement = document.querySelector('.js-button-genre');
  if (genreElement) {
    genreElement.innerHTML = html;
  }
}

function changeBanner (movie) {
  
  if (!movie) {
    console.error('No movie data provided to changeBanner');
    return;
  }

  const banner = document.querySelector('.js-banner');
  
  if (banner) {
    const imageUrl = `https://phimimg.com/${movie.thumb_url}`;
    
    banner.style.background = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url("${imageUrl}")`;
    banner.style.backgroundSize = 'cover';
    banner.style.backgroundPosition = 'center';
    banner.style.backgroundRepeat = 'no-repeat';
  } else {
    console.error('Banner element not found');
  }

  renderContent(movie);
  renderGenre(movie);
}