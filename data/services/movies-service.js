import {Movie, extraInfoMovie} from '../models/movies.js'
import { delay } from '../utils/movie-utils.js';

// Load pre-built movies data
async function loadPreBuiltMovies() {
  try {
    console.log('📦 Loading pre-built movies...');
    const response = await fetch('./movies-data/movies-data.json');
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Loaded ${data.totalMovies} pre-built movies from ${new Date(data.lastUpdate).toLocaleString()}`);
      return data.movies;
    } else {
      console.warn('⚠️ Pre-built data not found, status:', response.status);
    }
  } catch (error) {
    console.warn('⚠️ Cannot load pre-built data:', error.message);
  }
  return [];
}

export async function loadMoviesFetch() {
  const cachedMoviesRaw = localStorage.getItem('cachedMovie');
  const lastCheckTime = localStorage.getItem('lastNewMovieCheck');
  
  const now = Date.now();
  const checkNewMovieInterval = 30 * 60 * 1000; // 30 phút check phim mới
  
  const cachedMovies = cachedMoviesRaw ? JSON.parse(cachedMoviesRaw) : [];
  
  // TRƯỜNG HỢP 1: Chưa có cache - Load pre-built data trước
  if (!cachedMovies.length) {
    console.log('🔄 First visit - loading pre-built data...');
    const preBuiltMovies = await loadPreBuiltMovies();
    
    if (preBuiltMovies.length > 0) {
      // Save pre-built data to localStorage
      localStorage.setItem('cachedMovie', JSON.stringify(preBuiltMovies));
      localStorage.setItem('lastNewMovieCheck', now.toString());
      
      // Sau 5 giây sẽ check update ngầm (không block UI)
      setTimeout(() => {
        console.log('🔍 Background check for new movies...');
        const cachedMap = new Map(preBuiltMovies.map(m => [m.slug, m]));
        quickNewMovieCheck(cachedMap, now);
      }, 5000);
      
      return preBuiltMovies;
    } else {
      // Fallback: Fetch như cũ nếu không có pre-built data
      console.log('🚀 Fallback - fetching all from API...');
      return await fullFetchUpdate(new Map());
    }
  }
  
  // TRƯỜNG HỢP 2: Check phim mới
  const needNewMovieCheck = !lastCheckTime || (now - lastCheckTime > checkNewMovieInterval);
  if (needNewMovieCheck) {
    console.log('⚡ Checking for new movies...');
    const cachedMovieMap = new Map(cachedMovies.map(movie => [movie.slug, movie]));
    return await quickNewMovieCheck(cachedMovieMap, now);
  }
  
  // TRƯỜNG HỢP 3: Dùng cache cũ
  console.log('💾 Using cached movies');
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
    while (hasMore && page <= 30) { // Giới hạn 30 trang
      console.log(`📥 Fetching ${slug} - page ${page}`);
      try {
        const response = await fetch(`https://phimapi.com/v1/api/quoc-gia/${slug}?page=${page}`);
        
        if (!response.ok) {
          console.warn(`⚠️ ${slug} page ${page} failed: ${response.status}`);
          break;
        }
        
        const movieData = await response.json();
        const items = movieData.data?.items || [];
        const params = movieData.data?.params || {};

        if (items.length === 0) {
          console.log(`⏹️ ${slug} page ${page} empty, stopping...`);
          break;
        }

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
        
        console.log(`✅ ${slug} page ${page}: ${items.length} movies`);
        page++;
        await delay(300); // Delay để tránh rate limit
        
      } catch (error) {
        console.error(`❌ Error fetching ${slug} page ${page}:`, error.message);
        break;
      }
    }
  }

  const updatedMovies = Array.from(updateMovieMap.values());
  localStorage.setItem('cachedMovie', JSON.stringify(updatedMovies));
  localStorage.setItem('lastNewMovieCheck', now.toString());

  console.log(`📊 Full update complete: ${updatedMovies.length} movies`);
  return updatedMovies;
}

// ========== CHECK PHIM MỚI ==========
async function quickNewMovieCheck(cachedMovieMap, now) {
  const allCountrySlug = ['han-quoc', 'trung-quoc', 'nhat-ban', 'au-my'];
  const newMovies = [];
  const oldMovies = Array.from(cachedMovieMap.values());
  let hasNewMovies = false;

  for (const slug of allCountrySlug) {
    console.log(`🔍 Quick check ${slug} - page 1 only`);
    
    try {
      const response = await fetch(`https://phimapi.com/v1/api/quoc-gia/${slug}?page=1`);
      
      if (!response.ok) {
        console.warn(`⚠️ Quick check ${slug} failed: ${response.status}`);
        continue;
      }
      
      const movieData = await response.json();
      const items = movieData.data?.items || [];
      const params = movieData.data?.params || {};

      for (const item of items) {
        const cached = cachedMovieMap.get(item.slug);
        const isNew = !cached;
        const isUpdated = cached && item.episode_current !== cached.episode_current;

        if (isNew || isUpdated) {
          console.log(`🆕 New/Updated movie: ${item.name}`);
          const newMovie = new Movie(item, params);
          const mergedMovie = cached ? { ...newMovie, ...cached } : newMovie;
          
          newMovies.unshift(mergedMovie);
          
          const oldIndex = oldMovies.findIndex(m => m.slug === item.slug);
          if (oldIndex !== -1) {
            oldMovies.splice(oldIndex, 1);
          }
          
          hasNewMovies = true;
        }
      }
      
      // Delay giữa các country
      await delay(200);
      
    } catch (error) {
      console.error(`❌ Error quick checking ${slug}:`, error.message);
    }
  }

  if (hasNewMovies) {
    const finalMovies = [...newMovies, ...oldMovies];
    
    localStorage.setItem('cachedMovie', JSON.stringify(finalMovies));
    localStorage.setItem('lastNewMovieCheck', now.toString());
    console.log(`✅ Found ${newMovies.length} new movies, total: ${finalMovies.length}`);

    // Update fullMovieList
    try {
      const moviesModule = await import('../models/movies.js');
      moviesModule.fullMovieList.length = 0;
      moviesModule.fullMovieList.push(...finalMovies);
      
      // Trigger UI update
      triggerMovieUpdate();
    } catch (error) {
      console.warn('Could not update fullMovieList:', error);
    }
    
    return finalMovies;
  } else {
    localStorage.setItem('lastNewMovieCheck', now.toString());
    console.log('ℹ️ No new movies found');
    return oldMovies;
  }
}

// ========== CÁC HÀM KHÁC ==========
function triggerMovieUpdate() {
  console.log('🔄 Triggering UI update...');
  
  // Trigger custom event
  const event = new CustomEvent('moviesUpdated');
  window.dispatchEvent(event);
  
  // Also try to update categories
  import('../movie-list.js').then(({ updateMovieCategories }) => {
    updateMovieCategories();
  }).catch(error => {
    console.warn('Could not trigger update:', error);
  });
}

export async function forceCheckNewMovies() {
  console.log('🔄 Force checking new movies...');
  localStorage.removeItem('lastNewMovieCheck');
  const result = await loadMoviesFetch();
  return result;
}

export async function extraMovieFetch(movie) {
  try{
    const response = await fetch(`https://phimapi.com/phim/${movie.slug}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const movieData = data.movie;
    return new extraInfoMovie(movie, movieData);
  } catch(error){
    console.log(`Error fetching ${movie.slug}:`, error.message);
    return null;
  }
}

export async function loadExtraInfoMovie(movies, concurrency = 5){
  const result = [];
  let index = 0;
  
  while(index < movies.length){
    const batch = movies.slice(index, index + concurrency);
    const promises = batch.map(movie => extraMovieFetch(movie));
    const fullMovies = await Promise.all(promises);
    
    result.push(...fullMovies.filter(Boolean));
    index += concurrency;
    
    // Delay giữa các batch
    if (index < movies.length) {
      await delay(1000);
    }
  }
  
  return result;
}