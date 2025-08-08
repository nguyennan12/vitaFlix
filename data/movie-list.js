import {fullMovieList, moviePromise} from "../data/models/movies.js"
import { movieFilter } from "./utils/movie-utils.js";

export const catagorMovie = {};

// Expose to global for debugging
window.catagorMovie = catagorMovie;

// Hàm update categories - gọi khi cần refresh
export async function updateMovieCategories() {
  console.log('🔄 Updating movie categories...');
  console.log('fullMovieList length:', fullMovieList.length);
  
  try {
    catagorMovie.korea = {
      series: movieFilter.filterByCountry(fullMovieList, 'han-quoc', 'series'),
      single: movieFilter.filterByCountry(fullMovieList, 'han-quoc', 'single')
    }
    console.log('Korea movies:', catagorMovie.korea.series.length, 'series,', catagorMovie.korea.single.length, 'single');
    
    catagorMovie.china = {
      series: movieFilter.filterByCountry(fullMovieList, 'trung-quoc', 'series'),
      single: movieFilter.filterByCountry(fullMovieList, 'trung-quoc', 'single')
    }
    console.log('China movies:', catagorMovie.china.series.length, 'series,', catagorMovie.china.single.length, 'single');
    
    catagorMovie.japan = {
      series: movieFilter.filterByCountry(fullMovieList, 'nhat-ban', 'series'),
      single: movieFilter.filterByCountry(fullMovieList, 'nhat-ban', 'single'),
      anime: movieFilter.filterByCountry(fullMovieList, 'nhat-ban', 'hoathinh'),
    }
    console.log('Japan movies:', catagorMovie.japan.series.length, 'series,', catagorMovie.japan.anime.length, 'anime');
    
    catagorMovie.vietNam = {
      series: movieFilter.filterByCountry(fullMovieList, 'viet-nam', 'series'),
      single: movieFilter.filterByCountry(fullMovieList, 'viet-nam', 'single')
    }
    
    catagorMovie.auMy = {
      series: movieFilter.filterByCountry(fullMovieList, 'au-my', 'series'),
      single: movieFilter.filterByCountry(fullMovieList, 'au-my', 'single')
    }

    catagorMovie.full = fullMovieList;
    console.log('Full movie list:', catagorMovie.full.length);

    catagorMovie.single = await movieFilter.filterByType(fullMovieList, 'single');
    console.log('All single movies:', catagorMovie.single.length);
    
    // Xử lý favMovie
    console.log('🎬 Loading favorite movies...');
    catagorMovie.favMovie = await movieFilter.filterFavMovie();
    console.log('Favorite movies loaded:', catagorMovie.favMovie?.length || 0);
    
    // Log sample favorite movie
    if (catagorMovie.favMovie && catagorMovie.favMovie.length > 0) {
      console.log('Sample favorite movie:', {
        name: catagorMovie.favMovie[0].name,
        slug: catagorMovie.favMovie[0].slug,
        thumb_url: catagorMovie.favMovie[0].thumb_url
      });
    }
    
    catagorMovie.continute = await movieFilter.filterContinuteMovie();
    console.log('Continue movies:', catagorMovie.continute?.length || 0);
    
    console.log('✅ Categories updated successfully');
    console.log('Final catagorMovie keys:', Object.keys(catagorMovie));
    
    // Trigger re-render nếu có element
    const event = new CustomEvent('moviesUpdated', { detail: catagorMovie });
    window.dispatchEvent(event);
    
  } catch (error) {
    console.error('❌ Error updating categories:', error);
    throw error;
  }
}

//moviePromise là biến lưu các phim đang dc tải về sau đó mới sử dụng
export const movieListPromise = moviePromise.then(async () => {
  console.log('📽️ Starting movie categories initialization...');
  await updateMovieCategories();
  console.log('🎉 Movie categories initialization complete');
}).catch(error => {
  console.error('💥 Movie categories initialization failed:', error);
  throw error;
});