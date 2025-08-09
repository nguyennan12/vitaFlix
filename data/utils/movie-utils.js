import { getMovieFav} from "../services/movie-fav.js";

export class movieFilter {
  static filterByCountry(movies, countrySlug, typeSlug){
    return movies.filter(movie => {
      if(movie.country_slug === countrySlug && movie.type === typeSlug){
        return movie;
      };
    });
  };  
  
  static filterByType(movies, typeSlug){
    return movies.filter(movie => {
      if(movie.type === typeSlug){
        return movie;
      };
    });
  }; 
  
  static async filterFavMovie(){
    try {
      const cached = localStorage.getItem('movieFav');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        // Validate cached data
        if (parsedCache && Array.isArray(parsedCache) && parsedCache.length > 0) {
          const firstMovie = parsedCache[0];
          // Check if first movie has required properties
          if (firstMovie.name && firstMovie.category) {
            console.log('Using valid cached favMovie');
            return parsedCache;
          }
        }
        console.warn('Invalid cached favMovie, clearing cache');
        localStorage.removeItem('movieFav');
      }

      const favMovieSlug = [
        'nguu-lang-chuc-nu',
        'nguoi-hung-yeu-duoi-2',
        'khi-cuoc-doi-cho-ban-qua-quyt',
        'rung-khong-tieng',
        'the-gioi-ma-quai-phan-3',
        'kho-do-danh'
      ];
      
      console.log('Fetching fresh favorite movies...');
      const favList = await getMovieFav(favMovieSlug);
      
      if (favList && favList.length > 0) {
        console.log(`Successfully loaded ${favList.length} favorite movies`);
        return favList;
      } else {
        console.warn('No favorite movies could be loaded');
        return [];
      }
    } catch (error) {
      console.error('Error in filterFavMovie:', error);
      // Clear potentially corrupted cache
      localStorage.removeItem('movieFav');
      return [];
    }
  }

  static async filterContinuteMovie(){
    try {
      const cached = localStorage.getItem('movieContinute');
      if (cached) {
        const parsedCache = JSON.parse(cached);
        if (parsedCache && Array.isArray(parsedCache) && parsedCache.length > 0) {
          return parsedCache;
        }
      }
      
      const continuteMovieSlug = [
        'tinh-yeu-cua-mu-bi',
        'dua-hau-lap-lanh',
        'doona',
        'thanh-xuan-182-lu-trinh-huong-ve-em',
        'suyt-quoc-vuong-dang-ngu-dong',
      ];
      
      const continuteList = await getMovieFav(continuteMovieSlug);
      
      if (continuteList && continuteList.length > 0) {
        localStorage.setItem('movieContinute', JSON.stringify(continuteList));
        return continuteList;
      } else {
        console.warn('No continue movies could be loaded');
        return [];
      }
    } catch (error) {
      console.error('Error in filterContinuteMovie:', error);
      localStorage.removeItem('movieContinute');
      return [];
    }
  }
}

export function delay(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}