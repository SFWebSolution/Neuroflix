// ===== HAMBURGER & SIDEBAR =====
const hamburgerBtn = document.getElementById('hamburger-btn');
const sidebar = document.querySelector('.sidebar');
const playerOverlay = document.getElementById('player-overlay');

// create overlay for mobile sidebar
let overlay = document.createElement('div');
overlay.id = 'overlay';
document.body.appendChild(overlay);

function toggleSidebar() {
  if (playerOverlay.style.display === 'flex') return;
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
const YOUTUBE_API_KEY = 'AIzaSyCSh8xvmdWBE5luMtLmtO2uW3dKGy_e55o'; // Replace with your new key

window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('player-container', {
    height: '360',
    width: '640',
    videoId: '',
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
    setTimeout(() => playVideo(videoId), 500);
    return;
  }
  ytPlayer.loadVideoById(videoId);
  ytPlayer.playVideo();

  playerOverlay.style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if(window.innerWidth <= 768){
    hamburgerBtn.style.display = 'none';
  }
}

closePlayerBtn.addEventListener('click', () => {
  if (ytPlayer && ytReady) ytPlayer.stopVideo();
  playerOverlay.style.display = 'none';

  if(window.innerWidth <= 768){
    hamburgerBtn.style.display = 'block';
  }
});

// ===== CREATE VIDEO CARD =====
function createVideoCard(item, container) {
  if(!item.id || !item.id.videoId) return;

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

  div.querySelector('.play-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    playVideo(item.id.videoId);
  });
  div.querySelector('img').addEventListener('click', () => playVideo(item.id.videoId));

  container.appendChild(div);
}

// ===== FALLBACK VIDEOS =====
const fallbackVideos = [
  { id: { videoId: 'dQw4w9WgXcQ' }, snippet: { title: 'Fallback Video 1', channelTitle: 'Demo Channel', thumbnails: { medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' } } } },
  { id: { videoId: '3JZ_D3ELwOQ' }, snippet: { title: 'Fallback Video 2', channelTitle: 'Demo Channel', thumbnails: { medium: { url: 'https://i.ytimg.com/vi/3JZ_D3ELwOQ/mqdefault.jpg' } } } }
];

// ===== LOAD VIDEOS =====
async function loadVideos(containerId, query) {
  const container = document.getElementById(containerId);
  container.innerHTML = "Loading...";

  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&type=video&maxResults=12&q=${encodeURIComponent(query)}`);

    if (!res.ok) throw new Error(`YouTube API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    container.innerHTML = "";

    if (!data.items || !data.items.length) {
      fallbackVideos.forEach(item => createVideoCard(item, container));
      return;
    }

    data.items.forEach(item => createVideoCard(item, container));
  } catch(err) {
    console.error(err);
    container.innerHTML = "";
    fallbackVideos.forEach(item => createVideoCard(item, container));
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