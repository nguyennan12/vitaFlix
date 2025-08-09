import {fullMovieList, MovieFav} from "../models/movies.js"
import { extraMovieFetch } from "./movies-service.js";

export async function getMovieFav(favMovieSlug) {
  try {
    const cached = localStorage.getItem('movieFav');
    if (cached) {
      const parsedCache = JSON.parse(cached);
      // Kiểm tra cache có hợp lệ không
      if (parsedCache && parsedCache.length > 0 && parsedCache[0].category) {
        console.log('Using cached favMovie:', parsedCache.length);
        return parsedCache;
      } else {
        console.warn('Invalid cached favMovie data, refreshing...');
        localStorage.removeItem('movieFav');
      }
    }

    console.log('Fetching fresh favMovie data...');
    const favList = fullMovieList.filter(movie => favMovieSlug.includes(movie.slug));
    
    if (favList.length === 0) {
      console.warn('No favorite movies found in fullMovieList');
      return [];
    }

    console.log(`Found ${favList.length} favorite movies, fetching details...`);

    const detailedFavList = await Promise.all(
      favList.map(async (movie, index) => {
        try {
          console.log(`Fetching details for ${movie.name} (${index + 1}/${favList.length})`);
          const detail = await extraMovieFetch(movie);
          
          if (!detail) {
            console.warn(`Failed to fetch details for ${movie.name}`);
            return null;
          }

          // Kiểm tra data có đầy đủ không
          if (!detail.category || !Array.isArray(detail.category)) {
            console.warn(`Missing category for ${movie.name}, adding fallback`);
            detail.category = [{ name: 'Phim hay' }, { name: 'Đáng xem' }];
          }

          if (!detail.content) {
            detail.content = 'Đang cập nhật nội dung...';
          }

          const movieFav = new MovieFav(movie, detail);
          console.log(`✅ Successfully created MovieFav for ${movie.name}`);
          return movieFav;
          
        } catch (error) {
          console.error(`Error processing ${movie.name}:`, error);
          return null;
        }
      })
    );

    const validMovies = detailedFavList.filter(Boolean);
    
    if (validMovies.length > 0) {
      console.log(`Caching ${validMovies.length} favorite movies`);
      localStorage.setItem('movieFav', JSON.stringify(validMovies));
    } else {
      console.error('No valid favorite movies could be created');
    }

    return validMovies;

  } catch (error) {
    console.error('Error in getMovieFav:', error);
    
    // Clear invalid cache
    localStorage.removeItem('movieFav');
    
    // Return empty array instead of throwing
    return [];
  }
}