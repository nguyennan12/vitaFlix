import {fullMovieList, MovieFav} from "../models/movies.js"
import { extraMovieFetch } from "./movies-service.js";

export async function getMovieFav(favMovieSlug) {

  const favList = fullMovieList.filter( moive => favMovieSlug.includes(moive.slug));

  const detailedFavList = await Promise.all(
    favList.map(async (movie) => {
      const detail = await extraMovieFetch(movie);
      if(!detail) return null;
      return new MovieFav(movie,detail);
    })
  )
  return detailedFavList.filter(Boolean);
}



