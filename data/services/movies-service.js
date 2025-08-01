import {Movie, extraInfoMovie} from '../models/movies.js'
import { delay } from '../utils/movie-utils.js';

export async function loadMoviesFetch() {
  const cachedMoviesRaw = localStorage.getItem('cachedMovie');
  const lastCheckTime = localStorage.getItem('lastNewMovieCheck');

  const now = Date.now();
  const checkNewMovieInterval = 30 * 60 * 1000; // 30 phút check phim mới

  const cachedMovies = cachedMoviesRaw ? JSON.parse(cachedMoviesRaw) : [];
  const cachedMovieMap = new Map(cachedMovies.map(movie => [movie.slug, movie]));

  // TRƯỜNG HỢP 1: Chưa có cache - Fetch full lần đầu
  if (!cachedMovies.length) {
    console.log('🚀 Lần đầu - fetch tất cả');
    return await fullFetchUpdate(cachedMovieMap);
  }

  // TRƯỜNG HỢP 2: Check phim mới ở page 1
  const needNewMovieCheck = !lastCheckTime || (now - lastCheckTime > checkNewMovieInterval);
  if (needNewMovieCheck) {
    console.log('⚡ Quick check - chỉ fetch page 1 để tìm phim mới');
    return await quickNewMovieCheck(cachedMovieMap, now);
  }

  // TRƯỜNG HỢP 3: Dùng cache cũ
  console.log('💾 Dùng cache cũ');
  return cachedMovies;
}

// ========== FETCH FULL ==========
async function fullFetchUpdate(cachedMovieMap) {
  const allCountrySlug = ['han-quoc', 'trung-quoc', 'nhat-ban', 'au-my'];
  const updateMovieMap = new Map(cachedMovieMap);
  const now = Date.now();

  for (const slug of allCountrySlug) {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      console.log(`📥 Đang fetch ${slug} - page ${page}`);
      const response = await fetch(`https://phimapi.com/v1/api/quoc-gia/${slug}?page=${page}`);
      const movieData = await response.json();
      const items = movieData.data.items;
      const params = movieData.data.params;

      for (const item of items) {
        const cached = cachedMovieMap.get(item.slug);
        const isNew = !cached;
        const isUpdated = cached && item.episode_current !== cached.episode_current;

        if (isNew || isUpdated) {
          const newMovie = new Movie(item, params);
          const mergedMovie = cached ? { ...cached, ...newMovie } : newMovie;
          updateMovieMap.set(item.slug, mergedMovie);
        } else {
          updateMovieMap.set(item.slug, cached);
        }
      }
      hasMore = page < 100;
      page++;
    }
  }

  const updatedMovies = Array.from(updateMovieMap.values());
  localStorage.setItem('cachedMovie', JSON.stringify(updatedMovies));
  localStorage.setItem('lastNewMovieCheck', now.toString());

  console.log(`📊 Full update: ${updatedMovies.length} phim`);
  return updatedMovies;
}

// ========== CHECK PHIM MỚI - PHIM MỚI LÊN ĐẦU ==========
async function quickNewMovieCheck(cachedMovieMap, now) {
  const allCountrySlug = ['han-quoc', 'trung-quoc', 'nhat-ban', 'au-my'];
  const newMovies = [];
  const oldMovies = Array.from(cachedMovieMap.values());
  let hasNewMovies = false;

  for (const slug of allCountrySlug) {
    console.log(`🔍 Quick check ${slug} - page 1 only`);
    
    const response = await fetch(`https://phimapi.com/v1/api/quoc-gia/${slug}?page=1`);
    const movieData = await response.json();
    const items = movieData.data.items;
    const params = movieData.data.params;

    for (const item of items) {
      const cached = cachedMovieMap.get(item.slug);
      const isNew = !cached;
      const isUpdated = cached && item.episode_current !== cached.episode_current;

      if (isNew || isUpdated) {
        console.log(`🆕 Phim mới/cập nhật: ${item.name}`);
        const newMovie = new Movie(item, params);
        const mergedMovie = cached ? { ...newMovie, ...cached } : newMovie;
        
        // THÊM VÀO ĐẦU DANH SÁCH
        newMovies.unshift(mergedMovie);
        
        // XÓA KHỎI DANH SÁCH CŨ NẾU CÓ
        const oldIndex = oldMovies.findIndex(m => m.slug === item.slug);
        if (oldIndex !== -1) {
          oldMovies.splice(oldIndex, 1);
        }
        
        hasNewMovies = true;
      }
    }
  }

  if (hasNewMovies) {
    // GHÉP: PHIM MỚI + PHIM CŨ
    const finalMovies = [...newMovies, ...oldMovies];
    
    localStorage.setItem('cachedMovie', JSON.stringify(finalMovies));
    localStorage.setItem('lastNewMovieCheck', now.toString());
    console.log(`✅ Quick update: ${newMovies.length} phim mới, tổng ${finalMovies.length} phim`);

    // Update fullMovieList
    import('../models/movies.js').then((moviesModule) => {
      moviesModule.fullMovieList.length = 0;
      moviesModule.fullMovieList.push(...finalMovies);
    });
    
    // Trigger UI update
    triggerMovieUpdate();
    
    return finalMovies;
  } else {
    localStorage.setItem('lastNewMovieCheck', now.toString());
    console.log('ℹ️ Quick check: Không có phim mới');
    return oldMovies;
  }
}

// Trigger update UI
function triggerMovieUpdate() {
  console.log('🔄 Triggering movie update...');
  import('../movie-list.js').then(({ updateMovieCategories }) => {
    updateMovieCategories();
  }).catch(error => {
    console.warn('Could not trigger update:', error);
  });
}

// Force check manual
export async function forceCheckNewMovies() {
  console.log('🔄 Force check phim mới...');
  localStorage.removeItem('lastNewMovieCheck');
  const result = await loadMoviesFetch();
  triggerMovieUpdate();
  return result;
}

// Fetch chi tiết phim
export async function extraMovieFetch(movie) {
  try{
    const response = await fetch(`https://phimapi.com/phim/${movie.slug}`);
    const data = await response.json();
    const movieData = data.movie;
    return new extraInfoMovie(movie, movieData);
  } catch(error){
    console.log(`Lỗi khi fetch ${movie.slug}:`, error);
    return null;
  }
}

// Load full movie với concurrency
export async function loadExtraInfoMovie(movie, concurrency = 10){
  const result = [];
  let index = 0;
  
  while(index < movie.length){
    const batch = movie.slice(index, index + concurrency);
    const promises = batch.map(movie => extraMovieFetch(movie));
    const fullMovie = await Promise.all(promises);
    
    result.push(...fullMovie.filter(Boolean));
    index += concurrency;
    await delay(1500);
  }
  
  return result;
}