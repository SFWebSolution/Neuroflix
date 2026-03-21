// ===== HAMBURGER & SIDEBAR =====
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.querySelector('.sidebar');
const playerOverlay = document.getElementById('player-overlay');

// create overlay for mobile sidebar
let overlay = document.createElement('div');
overlay.id = 'overlay';
document.body.appendChild(overlay);

function toggleSidebar() {
  // prevent sidebar if video player is open
  if(playerOverlay.style.display === 'flex') return;

  sidebar.classList.toggle('active');
  overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
}

hamburgerBtn.addEventListener('click', toggleSidebar);

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.style.display = 'none';
});

// ===== NAVIGATION =====
const sections = document.querySelectorAll('.section');
document.querySelectorAll('.sidebar ul li').forEach(nav => {
  nav.addEventListener('click', () => {
    sections.forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar ul li').forEach(n => n.classList.remove('active'));
    nav.classList.add('active');

    if(nav.id === 'nav-home') document.getElementById('home-section').classList.add('active');
    if(nav.id === 'nav-search') document.getElementById('search-section').classList.add('active');
    if(nav.id === 'nav-categories') document.getElementById('categories-section').classList.add('active');
    if(nav.id === 'nav-profile') document.getElementById('profile-section').classList.add('active');

    // close sidebar on mobile after click
    if(window.innerWidth <= 768){
      sidebar.classList.remove('active');
      overlay.style.display = 'none';
    }
  });
});

// ===== PROFILE =====
let username = localStorage.getItem('neuroflix-username') || "Guest";
document.getElementById('profile-name').innerText = username;
document.getElementById('welcome-message').innerText = `Hello ${username}`;

document.getElementById('save-username-btn').addEventListener('click', () => {
  const input = document.getElementById('username-input').value.trim();
  if(input) {
    username = input;
    localStorage.setItem('neuroflix-username', username);
    document.getElementById('profile-name').innerText = username;
    document.getElementById('welcome-message').innerText = `Hello ${username}`;
    alert('Username saved!');
  } else {
    alert('Enter a valid username');
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  localStorage.removeItem('neuroflix-username');
  window.location.href = 'login.html';
});

// ===== YOUTUBE PLAYER =====
let ytPlayer;
let ytReady = false;
const YOUTUBE_API_KEY = 'AIzaSyCZvpx2aYf6D0QFj-NktBIxBAZiNcjCaAQ';

// Initialize YouTube Player
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('player-container', {
    height: '360',
    width: '640',
    videoId: '', // start empty
    playerVars: { autoplay: 0, controls: 1 },
    events: {
      onReady: function () { ytReady = true; },
      onError: function() { alert('Video cannot play'); }
    }
  });
};

// ===== PLAYER OVERLAY =====
const closePlayerBtn = document.getElementById('close-player');

function playVideo(videoId) {
  if (!ytReady) {
    // retry after 500ms if player is not ready
    setTimeout(() => playVideo(videoId), 500);
    return;
  }

  // load and play the video
  ytPlayer.loadVideoById(videoId);
  ytPlayer.playVideo();

  // show overlay
  playerOverlay.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // hide hamburger while video plays
  if(window.innerWidth <= 768){
    hamburgerBtn.style.display = 'none';
  }
}

closePlayerBtn.addEventListener('click', () => {
  if (ytPlayer && ytReady) ytPlayer.stopVideo();
  playerOverlay.style.display = 'none';

  // show hamburger again on mobile
  if(window.innerWidth <= 768){
    hamburgerBtn.style.display = 'block';
  }
});

// ===== CREATE VIDEO CARD =====
function createVideoCard(item, container) {
  if(!item.id.videoId) return;

  const div = document.createElement('div');
  div.classList.add('video-card');

  const title = item.snippet.title;
  const channel = item.snippet.channelTitle;
  const thumbnail = item.snippet.thumbnails.medium.url;

  div.innerHTML = `
    <img src="${thumbnail}" />
    <button class="play-btn">▶</button>
    <p class="video-title">${title}</p>
    <p class="channel-name">${channel}</p>
  `;

  // play when clicking either thumbnail or play button
  div.querySelector('.play-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    playVideo(item.id.videoId);
  });
  div.querySelector('img').addEventListener('click', () => playVideo(item.id.videoId));

  container.appendChild(div);
}

// ===== LOAD VIDEOS =====
async function loadVideos(containerId, query) {
  const container = document.getElementById(containerId);
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=12&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    container.innerHTML = "";
    data.items.forEach(item => createVideoCard(item, container));
  } catch(err) {
    container.innerHTML = "Failed to load videos";
    console.error(err);
  }
}

// ===== SEARCH =====
document.getElementById('search-btn').addEventListener('click', () => {
  const query = document.getElementById('search-query').value.trim();
  if(!query) return alert('Enter search query');
  loadVideos('search-results', query);
});

// ===== CATEGORIES =====
document.querySelectorAll('.category-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const query = btn.dataset.query;
    loadVideos('category-results', query);
    sections.forEach(s => s.classList.remove('active'));
    document.getElementById('categories-section').classList.add('active');
  });
});

// ===== INITIAL LOAD =====
loadVideos('comedy-videos', 'nigeria comedy skits');
loadVideos('movies-videos', 'latest movies');