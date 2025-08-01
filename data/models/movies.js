import { loadMoviesFetch } from "../services/movies-service.js";

export let fullMovieList = [];

//biến lưu movie toàn cục moviePromise
export const moviePromise = loadMoviesFetch().then(async (movies) => {
  fullMovieList = movies;
});



export class Movie {
  constructor(movieDetail, movieParams = {}) {
    this._id = movieDetail._id;
    this.name = movieDetail.name;
    this.origin_name = movieDetail.origin_name;
    this.poster_url = movieDetail.poster_url;
    this.slug = movieDetail.slug;
    this.thumb_url = movieDetail.thumb_url;
    this.year = movieDetail.year;
    this.type = movieDetail.type || 'unknown';
    this.episode_current = movieDetail.episode_current;
    this.quality = movieDetail.quality || 'unknown';
    

    this.modified = movieDetail.modified;
    this.country_slug = movieParams?.slug || '';
    this.country_name_slug = movieParams?.type_slug || '';
    this.total_pages = movieParams?.pagination?.totalPages || 0;
    this.current_page = movieParams?.pagination?.currentPage || 0;
  }
};

export class extraInfoMovie extends Movie {
  constructor(movieDetail, extraInfo){
    super(movieDetail);
    this.content = extraInfo.content
    this.quality = extraInfo.quality || 'unknown';
    this.episode_total = extraInfo.episode_total || 0;
    this.episode_current = extraInfo.episode_current;
    this.actor = extraInfo.actor;
    this.category = extraInfo.category;
    this.country = extraInfo.country;
    this.modified = extraInfo.modified;
    this.episodes = extraInfo.episodes;
  }
}

export class MovieFav extends extraInfoMovie{
  constructor(movieDetail, extraInfo){
    super(movieDetail, extraInfo);
    this.modified = extraInfo.modified;
    this.quality = movieDetail.quality || 'unknown';
    this.episode_total = extraInfo.episode_total || 0;
    this.episode_current = extraInfo.episode_current;
    this.episodes = extraInfo.episodes;
  }
}