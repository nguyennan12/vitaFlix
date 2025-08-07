document.querySelector('.js-textarea')
  .addEventListener('input', (e) => {
    let countCharater = e.target.value.length;
    const quanity = document.querySelector('.js-quanity-charater-comment');
    quanity.innerHTML = countCharater;
  })