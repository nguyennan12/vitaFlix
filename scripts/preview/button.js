let isPrivate = true;

// Khởi tạo trạng thái ban đầu
function initPrivacyToggle() {
  const textStatus = document.getElementById("privacy-text");
  const nameViewerComment = document.getElementById("name-viewer-comment");
  const avatarViewerComment = document.getElementById("avatar-viewer-comment");

  // Đảm bảo trạng thái ban đầu đúng
  if (isPrivate) {
    if (textStatus) textStatus.innerHTML = 'Ẩn danh<span><i class="fa-solid fa-rotate"></i></span>';
    if (nameViewerComment) nameViewerComment.innerHTML = 'Vô Danh';
    if (avatarViewerComment) avatarViewerComment.src = "/assets/images/avatar-default-3.jpg";
  } else {
    if (textStatus) textStatus.innerHTML = 'Công khai<span><i class="fa-solid fa-rotate"></i></span>';
    if (nameViewerComment) nameViewerComment.innerHTML = 'Nguyen An';
    if (avatarViewerComment) avatarViewerComment.src = "/assets/images/avatar-nan.jpg";
  }
}

// Xử lý toggle trạng thái privacy
function handlePrivacyToggle() {
  const statusButton = document.querySelector('.js-status-comment');
  
  if (!statusButton) {
    console.error('Privacy toggle button not found');
    return;
  }

  // Xóa event listener cũ nếu có
  const newStatusButton = statusButton.cloneNode(true);
  statusButton.parentNode.replaceChild(newStatusButton, statusButton);

  // Thêm event listener mới
  newStatusButton.addEventListener('click', () => {
    const textStatus = document.getElementById("privacy-text");
    const nameViewerComment = document.getElementById("name-viewer-comment");
    const avatarViewerComment = document.getElementById("avatar-viewer-comment");

    if (!textStatus || !nameViewerComment || !avatarViewerComment) {
      console.error('Required elements not found for privacy toggle');
      return;
    }

    // Toggle trạng thái
    isPrivate = !isPrivate;

    // Cập nhật UI với animation
    textStatus.style.opacity = '0.5';
    nameViewerComment.style.opacity = '0.5';
    avatarViewerComment.style.opacity = '0.5';

    setTimeout(() => {
      if (isPrivate) {
        // Chế độ ẩn danh
        textStatus.innerHTML = 'Ẩn danh<span><i class="fa-solid fa-rotate"></i></span>';
        nameViewerComment.innerHTML = 'Vô Danh';
        avatarViewerComment.src = "/assets/images/avatar-default-3.jpg";
      } else {
        // Chế độ công khai
        textStatus.innerHTML = 'Công khai<span><i class="fa-solid fa-rotate"></i></span>';
        nameViewerComment.innerHTML = 'Nguyen An';
        avatarViewerComment.src = "/assets/images/avatar-nan.jpg";
      }

      // Restore opacity
      textStatus.style.opacity = '1';
      nameViewerComment.style.opacity = '1';
      avatarViewerComment.style.opacity = '1';
    }, 150);

    // Lưu trạng thái vào localStorage
    localStorage.setItem('userPrivacyMode', JSON.stringify(isPrivate));
  });
}

// Load trạng thái đã lưu
function loadSavedPrivacyState() {
  const savedState = localStorage.getItem('userPrivacyMode');
  if (savedState !== null) {
    isPrivate = JSON.parse(savedState);
  }
}

// Khởi tạo khi DOM ready
function initPrivacySystem() {
  loadSavedPrivacyState();
  initPrivacyToggle();
  handlePrivacyToggle();
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPrivacySystem);
} else {
  initPrivacySystem();
}

// Export để có thể gọi từ bên ngoài nếu cần
export { initPrivacySystem, isPrivate };