import {fullMovieList, moviePromise} from "../data/models/movies.js"
import { movieFilter } from "./utils/movie-utils.js";

export const catagorMovie = {};

// Hàm update categories - gọi khi cần refresh
export async function updateMovieCategories() {
  console.log('🔄 Updating movie categories...');
  catagorMovie.korea = {
    series: movieFilter.filterByCountry(fullMovieList, 'han-quoc', 'series'),
    single: movieFilter.filterByCountry(fullMovieList, 'han-quoc', 'single')
  }
  catagorMovie.china = {
    series: movieFilter.filterByCountry(fullMovieList, 'trung-quoc', 'series'),
    single: movieFilter.filterByCountry(fullMovieList, 'trung-quoc', 'single')
  }
  catagorMovie.japan = {
    series: movieFilter.filterByCountry(fullMovieList, 'nhat-ban', 'series'),
    single: movieFilter.filterByCountry(fullMovieList, 'nhat-ban', 'single'),
    anime: movieFilter.filterByCountry(fullMovieList, 'nhat-ban', 'hoathinh'),
  }
  catagorMovie.vietNam = {
    series: movieFilter.filterByCountry(fullMovieList, 'viet-nam', 'series'),
    single: movieFilter.filterByCountry(fullMovieList, 'viet-nam', 'single')
  }
  catagorMovie.auMy = {
    series: movieFilter.filterByCountry(fullMovieList, 'au-my', 'series'),
    single: movieFilter.filterByCountry(fullMovieList, 'au-my', 'single')
  }

  catagorMovie.full = fullMovieList;

  catagorMovie.single = await movieFilter.filterByType(fullMovieList, 'single');
  catagorMovie.favMovie = await movieFilter.filterFavMovie();
  catagorMovie.continute = await movieFilter.filterContinuteMovie();
  console.log(catagorMovie.continute);
  console.log('✅ Categories updated');
  
  // Trigger re-render nếu có element
  const event = new CustomEvent('moviesUpdated', { detail: catagorMovie });
  window.dispatchEvent(event);
}

//moviePromise là biến lưu các phim đang dc tải về sau đó mới sử dụng
export const movieListPromise = moviePromise.then(async () => {
  await updateMovieCategories();
});

