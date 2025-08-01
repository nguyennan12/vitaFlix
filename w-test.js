const element = document.querySelector(titleList);
  if (element) {
    element.innerHTML = listHTML;
    // Add click handlers after rendering
    addMovieClickHandlers(element);
  }
