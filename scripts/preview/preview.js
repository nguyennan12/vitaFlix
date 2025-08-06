import { extraMovieFetch } from "../../data/services/movies-service.js";
import { catagorMovie, movieListPromise } from "../../data/movie-list.js";

// Lấy slug từ URL
function getMovieSlugFromURL() {
  const path = window.location.pathname;
  const segments = path.split('/');
  return segments[segments.length - 1]; // Lấy phần cuối cùng sau dấu /
}

// Tìm movie từ slug
async function findMovieBySlug(slug) {
  // Đợi data load xong
  await movieListPromise;
  
  // Tìm trong tất cả movies
  const allMovies = catagorMovie.full || [];
  return allMovies.find(movie => movie.slug === slug);
}

// Render thông tin phim
async function renderMovieDetail(movie) {
  if (!movie) {
    console.error('Movie not found');
    return;
  }

  try {
    // Fetch thông tin chi tiết
    const detailedMovie = await extraMovieFetch(movie);
    
    if (!detailedMovie) {
      console.error('Could not fetch detailed movie info');
      return;
    }

    // Update title
    document.title = `${detailedMovie.name} - VitaFlix`;

    // Update thumb image
    const thumbImg = document.querySelector('.thumb-box img');
    if (thumbImg) {
      thumbImg.src = `https://phimimg.com/${detailedMovie.thumb_url}`;
      thumbImg.alt = detailedMovie.name;
    }

    // Update poster
    const posterImg = document.querySelector('.poster-left-box img');
    if (posterImg) {
      posterImg.src = `https://phimimg.com/${detailedMovie.poster_url}`;
      posterImg.alt = detailedMovie.name;
    }

    // Update movie info
    const infoElements = document.querySelectorAll('.info div');
    if (infoElements.length >= 4) {
      infoElements[0].textContent = 'IMDb 8.9'; // Có thể random hoặc lấy từ API
      infoElements[1].textContent = detailedMovie.quality || 'HD';
      infoElements[2].textContent = detailedMovie.year || '2024';
      infoElements[3].textContent = detailedMovie.episode_current || 'Full';
    }

    // Update title
    const titleElement = document.querySelector('.title-right-box p');
    const subtitleElement = document.querySelector('.title-right-box span');
    if (titleElement) titleElement.textContent = detailedMovie.name;
    if (subtitleElement) subtitleElement.textContent = detailedMovie.origin_name;

    // Update genre info
    const genreElements = document.querySelectorAll('.genre p');
    if (genreElements.length >= 4) {
      // Thể loại
      if (detailedMovie.category && detailedMovie.category.length > 0) {
        const categories = detailedMovie.category.map(cat => cat.name).join(' • ');
        genreElements[0].innerHTML = `<span>Thể loại: </span>${categories}`;
      }
      
      // Quốc gia
      if (detailedMovie.country && detailedMovie.country.length > 0) {
        const countries = detailedMovie.country.map(country => country.name).join(' • ');
        genreElements[1].innerHTML = `<span>Quốc gia: </span>${countries}`;
      }
      
      // Diễn viên
      if (detailedMovie.actor && detailedMovie.actor.length > 0) {
        const actors = detailedMovie.actor.slice(0, 4).join(' • ');
        genreElements[2].innerHTML = `<span>Diễn viên: </span>${actors}`;
      }
      
      // Mô tả
      if (detailedMovie.content) {
        genreElements[3].innerHTML = `<span>Giới thiệu: </span>${detailedMovie.content}`;
      }
    }

    // Update episode status
    const statusElement = document.querySelector('.status p');
    if (statusElement && detailedMovie.episode_current) {
      const isComplete = detailedMovie.episode_current === detailedMovie.episode_total || 
                        detailedMovie.episode_current.includes('Full') ||
                        detailedMovie.type === 'single';
      
      statusElement.innerHTML = isComplete 
        ? '<span><i class="fa-solid fa-circle-check"></i></span>hoàn thành'
        : '<span><i class="fa-solid fa-clock"></i></span>đang cập nhật';
      
      statusElement.className = isComplete ? 'status complete' : 'status ongoing';
    }

    // Update episodes list
    renderEpisodeList(detailedMovie);

  } catch (error) {
    console.error('Error rendering movie detail:', error);
  }
}

// Render danh sách tập phim
function renderEpisodeList(movie) {
  const episodeListContainer = document.querySelector('.episode-list');
  
  if (!episodeListContainer) return;

  let episodeHTML = '';

  if (movie.episodes && movie.episodes.length > 0) {
    // Nếu có dữ liệu episodes từ API
    movie.episodes.forEach((episode, index) => {
      if (episode.server_data && episode.server_data.length > 0) {
        episode.server_data.forEach(ep => {
          episodeHTML += `
            <div>
              <a href="#" data-episode="${ep.slug}">
                <i class="fa-solid fa-play play"></i>${ep.name}
              </a>
            </div>
          `;
        });
      }
    });
  } else if (movie.type === 'series' && movie.episode_total) {
    // Fallback: tạo danh sách tập dựa trên episode_total
    const totalEpisodes = parseInt(movie.episode_total) || 12;
    for (let i = 1; i <= totalEpisodes; i++) {
      episodeHTML += `
        <div>
          <a href="#" data-episode="tap-${i}">
            <i class="fa-solid fa-play play"></i>Tập ${i}
          </a>
        </div>
      `;
    }
  } else {
    // Phim lẻ
    episodeHTML = `
      <div>
        <a href="#" data-episode="full">
          <i class="fa-solid fa-play play"></i>Full
        </a>
      </div>
    `;
  }

  episodeListContainer.innerHTML = episodeHTML;
}

// Render phim đề xuất (từ cùng quốc gia)
function renderRecommendations(currentMovie) {
  if (!currentMovie) return;

  let recommendedMovies = [];
  
  // Lấy phim cùng quốc gia
  const countrySlug = currentMovie.country_slug;
  const movieType = currentMovie.type;

  if (countrySlug && catagorMovie[getCountryKey(countrySlug)]) {
    const countryMovies = catagorMovie[getCountryKey(countrySlug)];
    
    if (movieType === 'series' && countryMovies.series) {
      recommendedMovies = countryMovies.series.filter(movie => movie.slug !== currentMovie.slug);
    } else if (movieType === 'single' && countryMovies.single) {
      recommendedMovies = countryMovies.single.filter(movie => movie.slug !== currentMovie.slug);
    } else if (movieType === 'hoathinh' && countryMovies.anime) {
      recommendedMovies = countryMovies.anime.filter(movie => movie.slug !== currentMovie.slug);
    }
  }

  // Fallback: lấy từ tất cả phim
  if (recommendedMovies.length === 0) {
    recommendedMovies = catagorMovie.full?.filter(movie => 
      movie.slug !== currentMovie.slug && movie.type === movieType
    ) || [];
  }

  // Render 5 phim đầu tiên
  renderListMovieRecommend(recommendedMovies.slice(0, 5));
}

// Helper function để convert country slug
function getCountryKey(countrySlug) {
  const mapping = {
    'han-quoc': 'korea',
    'trung-quoc': 'china',
    'nhat-ban': 'japan',
    'au-my': 'auMy',
    'viet-nam': 'vietNam'
  };
  return mapping[countrySlug] || 'korea';
}

// Render recommended movies trong preview page
function renderListMovieRecommend(movies) {
  let html = '';
  movies.slice(0, 5).forEach(movie => {
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
    `;
  });
  
  const container = document.querySelector('.js-movie-list-recommend');
  if (container) {
    container.innerHTML = html;
  }
}

// Main initialization
async function initPreviewPage() {
  const slug = getMovieSlugFromURL();
  
  if (!slug) {
    console.error('No movie slug found in URL');
    return;
  }

  console.log('Loading movie with slug:', slug);

  try {
    const movie = await findMovieBySlug(slug);
    
    if (movie) {
      await renderMovieDetail(movie);
      renderRecommendations(movie);
    } else {
      console.error('Movie not found with slug:', slug);
      // Có thể redirect về trang chủ hoặc hiển thị 404
    }
  } catch (error) {
    console.error('Error initializing preview page:', error);
  }
}

// Start when DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreviewPage);
} else {
  initPreviewPage();
}

export { initPreviewPage };