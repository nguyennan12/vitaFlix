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
    const cached = localStorage.getItem('movieFav');
    if (cached) {
      return JSON.parse(cached);
    }
    const favMovieSlug = [
        'nguu-lang-chuc-nu',
        'nguoi-hung-yeu-duoi-2',
        'khi-cuoc-doi-cho-ban-qua-quyt',
        'rung-khong-tieng',
        'the-gioi-ma-quai-phan-3',
        'kho-do-danh'
      ];
    const favList = await getMovieFav(favMovieSlug);
    localStorage.setItem('movieFav', JSON.stringify(favList));  
    return favList;
  }

  static async filterContinuteMovie(){
    const cached = localStorage.getItem('movieContinute');
    if (cached) {
      return JSON.parse(cached);
    }
    const continuteMovieSlug = [
        'tinh-yeu-cua-mu-bi',
        'dua-hau-lap-lanh',
        'doona',
        'thanh-xuan-182-lu-trinh-huong-ve-em',
        'suyt-quoc-vuong-dang-ngu-dong',
      ];
    const continuteList = await getMovieFav(continuteMovieSlug);
    localStorage.setItem('movieContinute', JSON.stringify(continuteList));  
    return continuteList;
  }
}

export function delay(ms){
  return new Promise(resolve => setTimeout(resolve,ms));
}


