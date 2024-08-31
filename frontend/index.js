// Initialize the agent
const agent = new window.ic.HttpAgent();
const backend = window.ic.createActor("backend", {
  agent,
  canisterId: "<YOUR_BACKEND_CANISTER_ID>"
});

// DOM elements
const feed = document.getElementById('feed');
const postBtn = document.getElementById('postBtn');
const modal = document.getElementById('uploadModal');
const closeBtn = document.getElementsByClassName('close')[0];
const uploadForm = document.getElementById('uploadForm');
const menuItems = document.querySelectorAll('.menu-item');

// Event listeners
postBtn.onclick = () => modal.style.display = "block";
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

uploadForm.onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('photoTitle').value;
  const category = document.getElementById('photoCategory').value;
  const file = document.getElementById('photoUpload').files[0];

  // TODO: Implement file upload to the backend
  // For now, we'll just use a placeholder URL
  const result = await backend.addPhoto("user123", title, category, new Uint8Array());
  
  if ('ok' in result) {
    modal.style.display = "none";
    uploadForm.reset();
    fetchPhotos();
  } else {
    alert('Failed to upload photo: ' + result.err);
  }
};

menuItems.forEach(item => {
  item.addEventListener('click', () => {
    const category = item.getAttribute('data-category');
    fetchPhotos(category);
  });
});

async function fetchPhotos(category = 'all') {
  let photos;
  if (category === 'all') {
    photos = await backend.getPhotos();
  } else {
    photos = await backend.getPhotosByCategory(category);
  }
  renderPhotos(photos);
}

function renderPhotos(photos) {
  feed.innerHTML = '';
  photos.forEach(photo => {
    const postElement = createPostElement(photo);
    feed.appendChild(postElement);
  });
}

function createPostElement(photo) {
  const postElement = document.createElement('div');
  postElement.className = 'post';
  postElement.innerHTML = `
    <div class="post-header">
      <img src="/api/placeholder/32/32" alt="User Avatar">
      <span class="username">${photo.username}</span>
      <span class="category-tag">${photo.category}</span>
    </div>
    <div class="post-image">
      <img src="${photo.url}" alt="${photo.title}">
    </div>
    <div class="post-actions">
      <button class="action-btn like-btn" data-id="${photo.id}">
        <svg class="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="#000" stroke-width="2"/></svg>
      </button>
      <span class="post-likes">${photo.likes} likes</span>
    </div>
    <div class="post-caption">
      <strong>${photo.username}</strong> ${photo.title}
    </div>
    <div class="comments">
      ${photo.comments.map(comment => `
        <div class="comment"><strong>${comment.username}</strong> ${comment.content}</div>
      `).join('')}
    </div>
    <form class="comment-form" data-id="${photo.id}">
      <input type="text" class="comment-input" placeholder="Add a comment...">
      <button type="submit" class="comment-submit">Post</button>
    </form>
  `;

  const likeBtn = postElement.querySelector('.like-btn');
  likeBtn.addEventListener('click', async () => {
    const result = await backend.likePhoto(BigInt(photo.id));
    if ('ok' in result) {
      const likesElement = postElement.querySelector('.post-likes');
      likesElement.textContent = `${Number(photo.likes) + 1} likes`;
    }
  });

  const commentForm = postElement.querySelector('.comment-form');
  commentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = commentForm.querySelector('.comment-input');
    const content = input.value.trim();
    if (content) {
      const result = await backend.addComment(BigInt(photo.id), "user123", content);
      if ('ok' in result) {
        const commentsContainer = postElement.querySelector('.comments');
        const newComment = document.createElement('div');
        newComment.className = 'comment';
        newComment.innerHTML = `<strong>user123</strong> ${content}`;
        commentsContainer.appendChild(newComment);
        input.value = '';
      }
    }
  });

  return postElement;
}

// Initial load
fetchPhotos();
