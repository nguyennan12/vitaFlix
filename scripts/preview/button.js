let isPrivate = true;

document.querySelector('.js-status-comment')
  .addEventListener('click', () => {
    const textStatus = document.getElementById("privacy-text");
    const nameViewerComment = document.getElementById("name-viewer-comment");
    const avatarViewetComment = document.getElementById("avatar-viewer-comment");

    isPrivate = !isPrivate;

    if(isPrivate){
      textStatus.innerHTML = 'Ẩn danh<span><i class="fa-solid fa-rotate"></i></span>';
      nameViewerComment.innerHTML = 'Nguyên An';
      avatarViewetComment.src = "assets/images/avatar-nan.jpg";
    }else{
      textStatus.innerHTML = 'Công khai<span><i class="fa-solid fa-rotate"></i></span>';
      nameViewerComment.innerHTML = 'Vô Danh';
      avatarViewetComment.src = "assets/images/avatar-default-3.jpg";
    }
  })
