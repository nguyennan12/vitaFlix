
const textarea = document.querySelector('.js-textarea');
const sendBtn = document.querySelector('.js-send-button');
let quanity;


handleComment();

export function handleComment() {
  textarea.addEventListener('input', (e) => {
    let countCharater = e.target.value.length;
    quanity = document.querySelector('.js-quanity-charater-comment');
    quanity.innerHTML = countCharater;
  })

  sendBtn.addEventListener('click', addComment)
  textarea.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      addComment();
    }
  })
}


function addComment () {
  const content = textarea.value;
  const contentComment = document.querySelector('.js-content-comment')

  let comments = JSON.parse(localStorage.getItem('saveTextComment')) || [];
  comments.unshift(content);
  console.log(comments)
  
  localStorage.setItem('saveTextComment', JSON.stringify(comments));

  textarea.value = '';
  quanity.innerHTML = '0';

  let commentHtml = '';

  const commentLimited = comments.slice(0,10);
  commentLimited.forEach((comment) => {
    commentHtml += `
      <div class="viewer-comment">
        <div class="avatar-show-comment">
          <div class="avatar">
            <img src="/assets/images/avatar-nan.jpg">
          </div>
        </div>
        <div class="place-viewer-comment">
          <div class="name-comment">
            <p><span>Nguyen An </span> &#183; 1 giờ trước</p>
          </div>
          <div class="content-comment">
            <div>${comment}</div>
          </div>
          <div class="react-comment">
            <p><i class="fa-solid fa-thumbs-up"></i><span>1</span></p>
            <p><i class="fa-solid fa-thumbs-down"></i><span></span></p>
            <p><i class="fa-solid fa-reply"></i><span>Trả lời</span></p>
            <p><i class="fa-solid fa-ellipsis"></i><span>Thêm</span></p>
          </div> 
        </div>
      </div>
    `
  })
  document.querySelector('.js-comment')
    .innerHTML = commentHtml;
}

