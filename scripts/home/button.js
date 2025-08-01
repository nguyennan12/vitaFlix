scrollButton();

function scrollButton() {
  const scrollButton = document.querySelectorAll('.js-scroll-button');
  scrollButton.forEach(btn => {
    btn.addEventListener('click', () => {
      const slug = btn.dataset.slug;
      const list = document.querySelector(`.js-movie-list-${slug}`);
      if(btn.classList.contains('prev') || btn.classList.contains('prev1')){
        list.scrollLeft -= 1350;
      }else{
        list.scrollLeft += 1350;
      };
      
    });
  });
};

export function randomFilm(movies, renderFunc, titleList) {
  const btn = document.querySelector('.js-reload-button');
  
  // Kiểm tra xem có danh sách đã random trong localStorage không
  const savedMovies = localStorage.getItem('randomizedMovies');
  
  if (savedMovies) {
    const parsedMovies = JSON.parse(savedMovies);
    renderFunc(parsedMovies, titleList);
  } 
  
  btn.addEventListener('click', () => {
    const shuffled = shuffleArray([...movies]);
    renderFunc(shuffled, titleList);
    
    // Lưu danh sách đã random vào localStorage
    localStorage.setItem('randomizedMovies', JSON.stringify(shuffled));
  });
}

// Hàm xáo trộn mảng
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
