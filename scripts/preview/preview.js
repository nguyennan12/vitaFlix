import { extraMovieFetch } from "/data/services/movies-service.js";
import { catagorMovie, movieListPromise } from "/data/movie-list.js";
import { randomIDMb } from "../home/utils-content.js";

// Lấy slug từ URL (hỗ trợ cả path và query parameter)
function getMovieSlugFromURL() {
  // Thử lấy từ URL path trước
  const path = window.location.pathname;
  const segments = path.split('/');
  const slugFromPath = segments[segments.length - 1];
  
  // Nếu có slug từ path và không phải là file HTML
  if (slugFromPath && slugFromPath !== 'preview.html' && !slugFromPath.includes('.')) {
    return slugFromPath;
  }
  
  // Fallback: lấy từ query parameter ?slug=movie-slug
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('slug');
}

// Tìm movie từ slug
async function findMovieBySlug(slug) {
  if (!slug) return null;
  
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
    // Hiển thị message lỗi cho user
    showErrorMessage('Không tìm thấy thông tin phim');
    return;
  }

  try {
    console.log('Rendering movie:', movie.name);
    
    // Fetch thông tin chi tiết
    const detailedMovie = await extraMovieFetch(movie);
    
    if (!detailedMovie) {
      console.error('Could not fetch detailed movie info');
      showErrorMessage('Không thể tải thông tin chi tiết phim');
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
      infoElements[0].textContent = `IMDb ${randomIDMb()}`; // Có thể random hoặc lấy từ API
      infoElements[1].textContent = detailedMovie.quality || 'HD';
      infoElements[2].textContent = detailedMovie.year || '2024';
      if(detailedMovie.type === 'single'){
        infoElements[3].textContent = 'Full'
      }else{
        infoElements[3].textContent = `Tập ${detailedMovie.episode_total}`;
      }
      
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
                        detailedMovie.episode_current.includes('Hoàn Tất') ||
                        detailedMovie.type === 'single';
      
      statusElement.innerHTML = isComplete 
        ? '<span><i class="fa-solid fa-circle-check"></i></span>hoàn thành'
        : '<span><i class="fa-solid fa-clock"></i></span>đang cập nhật';
      
      statusElement.className = isComplete ? 'status complete' : 'status ongoing';
    }

    // Update episodes list
    renderEpisodeList(detailedMovie);

    // Hide loading message
    hideErrorMessage();

  } catch (error) {
    console.error('Error rendering movie detail:', error);
    showErrorMessage('Đã xảy ra lỗi khi tải thông tin phim');
  }
}

// Hiển thị lỗi cho user
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = `
    <div style="text-align: center; padding: 50px; color: #666;">
      <h2>Oops!</h2>
      <p>${message}</p>
      <a href="/" style="color: #007bff; text-decoration: none;">← Về trang chủ</a>
    </div>
  `;
  
  const main = document.querySelector('main section');
  if (main) {
    main.innerHTML = errorDiv.innerHTML;
  }
}

function hideErrorMessage() {
  // Logic để ẩn error message nếu cần
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
  } else if (movie.type === 'single' && movie.episode_total) {

    // Phim lẻ
    episodeHTML = `
      <div>
        <a href="#" data-episode="full">
          <i class="fa-solid fa-play play"></i>Full
        </a>
      </div>
    `;
  } else {
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
    const linkPrefix = window.location.pathname.includes('/preview/') ? '' : 'preview/';
    html += `
      <div class="movie-recommend-box">
        <div class="poster-movie-recommend">
          <a href="${linkPrefix}${movie.slug}">
            <img src="https://phimimg.com/${movie.poster_url}">
          </a>
        </div>
        <div class="info-movie-recommend">
          <div class="name-movie-recommend">
            <p>${movie.name}</p>
            <p>${movie.origin_name}</p>
          </div>
          <div>
            <a href="${linkPrefix}${movie.slug}">Thông tin phim<i class="fa-solid fa-angle-right"></i></a>
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
  
  console.log('=== PREVIEW PAGE DEBUG ===');
  console.log('Current URL:', window.location.href);
  console.log('Extracted slug:', slug);
  console.log('Movie categories loaded:', !!catagorMovie.full);
  
  if (!slug) {
    console.error('No movie slug found in URL');
    showErrorMessage('Không tìm thấy mã phim trong URL');
    return;
  }

  console.log('Loading movie with slug:', slug);

  try {
    await movieListPromise; // Đợi data load
    console.log('Total movies available:', catagorMovie.full?.length || 0);
    
    const movie = await findMovieBySlug(slug);
    
    if (movie) {
      console.log('Found movie:', movie);
      await renderMovieDetail(movie);
      renderRecommendations(movie);
    } else {
      console.error('Movie not found with slug:', slug);
      console.log('Available slugs:', catagorMovie.full?.slice(0, 5).map(m => m.slug));
      showErrorMessage(`Không tìm thấy phim với mã: ${slug}`);
    }
  } catch (error) {
    console.error('Error initializing preview page:', error);
    showErrorMessage('Đã xảy ra lỗi khi khởi tạo trang');
  }
}

// Start when DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPreviewPage);
} else {
  initPreviewPage();
}

export { initPreviewPage };