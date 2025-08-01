export function randomIDMb() {
  const random = Math.random() * (9.4 - 8.1) + 8.1;
  return parseFloat(random.toFixed(1));
}

function getRandomInteger1to10(type, max_episode) {
  if(type === 'single'){
    return '';
  }else{
    return Math.floor(Math.random() * (max_episode - 1)) + 1;
  }
}

function getRandomFormattedTime(type) {
  let totalMinutes;
  if(type === 'single') {
    totalMinutes = Math.floor(Math.random() * (120 - 90 + 1)) + 90;
  }else if(type === 'hoathinh'){
    totalMinutes = Math.floor(Math.random() * (30 - 24 + 1)) + 24;
  }else{
    totalMinutes = Math.floor(Math.random() * (70 - 56 + 1)) + 56;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours > 0 ? hours + "h " : ""} ${minutes >= 10 ? minutes : "0" + minutes}m`;
}

export function randomContinute(type, max_episode) {
  const episode = getRandomInteger1to10(type, max_episode);
  const timeFilm = getRandomFormattedTime(type);
  const minutes = Math.floor(Math.random() * ( 56 - 10 + 1)) + 10;
  return `${episode > 0 ? "Tập " + episode + " &#183;" : '' } ${minutes +"m <span>&#47"} ${timeFilm + "</span>"}`;
}

