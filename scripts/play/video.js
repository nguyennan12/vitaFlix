document.addEventListener("DOMContentLoaded", function () {
  var video = document.getElementById('video');

  if (Hls.isSupported()) {
    var hls = new Hls();
    hls.loadSource('https://s2.phim1280.tv/20230912/Ag3akTi3/index.m3u8');
    hls.attachMedia(video);
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = 'https://s2.phim1280.tv/20230912/Ag3akTi3/index.m3u8';
  }

  const player = new Plyr(video,{
    controls: [
      'play-large', 'restart', 'rewind', 'play', 'fast-forward',
      'progress', 'current-time', 'duration', 'mute', 'volume',
      'captions', 'settings', 'pip', 'airplay', 'fullscreen'
    ],
    settings: ['captions', 'quality', 'speed'], // Các mục trong menu Settings
    quality: {
      default: 720,
      options: [1080, 720, 480, 360]
    }
  });
});