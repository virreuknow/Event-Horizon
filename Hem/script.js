let limitThing = 4;
let limitthing = 4
let oddOrEven = 1
let oddoreven = 1
let buttonArc = document.getElementById('buttonArticle');
let buttonBlog = document.getElementById('buttonBlog');
let input = document.getElementById('input')
let articleContent = 0
let articleContent2 = 0
let loggedIn = false;
let followedWords = [];
let loggedInUser = null;

function moreFunc(btn) {
    if (btn === 'article') {
        limitThing = (oddOrEven % 2 === 0) ? 4 : (2*limitThing);
        buttonArc.innerHTML = (oddOrEven % 2 === 0) ? "Show more..." : "Hide";
        oddOrEven += 1;
        fetchArticles();
    } else if (btn === 'blog') {
        limitthing = (oddoreven % 2 === 0) ? 4 : (2*limitthing);
        buttonBlog.innerHTML = (oddoreven % 2 === 0) ? "Show more" : "Hide";
        oddoreven += 1;
        fetchBlogs();
    }
}


function searchNews() {
    articleContent = `title_contains=${input.value}`
    articleContent2 = `summary_contains=${input.value}`
    fetchArticles()
    fetchBlogs()
    fetchReports();
}

async function fetchLatestNews() {
    const [articlesRes, blogsRes] = await Promise.all([ //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
      fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=1&offset=0'),
      fetch('https://api.spaceflightnewsapi.net/v4/blogs/?limit=1&offset=0') //https://api.spaceflightnewsapi.net/v4/docs/
    ]);

    const articleData = await articlesRes.json();
    const blogData = await blogsRes.json();

    const latest = ((articleData.results[0].published_at) > (blogData.results[0].published_at)) ? (articleData.results[0]) : (blogData.results[0])



    document.getElementById('breaking-news').innerHTML = `
      <a href="${latest.url}" target="_blank" style="color:white;text-decoration:none;display: block;">🚨 ${latest.title}</a>
    `;
}

async function fetchArticles() {
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?${articleContent}&${articleContent2}&limit=${limitThing}&offset=0`)
    const data = await res.json()
    const container = document.getElementById('article-container')
    container.innerHTML = ''
    if(data.results.length != 0) {
    

    data.results.forEach(artikel => {
        const div = document.createElement('div')
        div.className = 'news-card'
        div.onclick = function () {window.open(artikel.url, '_blank')}
        div.innerHTML = `
        <img src="${artikel.image_url}">
        <div class="news-card-content">
            <h3>${artikel.title}</h3>
            <p>${artikel.summary.substring(0, 100)}...</p>
            <a href="${artikel.url}" target="_blank">Full article</a>
        </div>
        `;
        container.appendChild(div);
    })
    } else container.innerHTML = "Hittar inget..."
}

async function fetchBlogs() {
    fetch('https://api.spaceflightnewsapi.net/v4/blogs/?limit=8&offset=0') //så att den laddats redan innan man tryckt på pilen
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/blogs/?${articleContent}&${articleContent2}&limit=${limitthing}&offset=0`)
    const data = await res.json()
    const container = document.getElementById('blogs-container')
    container.innerHTML = ''

    if(data.results.length != 0) {
    data.results.forEach(blog => {
        const div = document.createElement('div')
        div.className = 'news-card'
        div.onclick = function () {window.open(blog.url, '_blank')}
        div.innerHTML = `
        <img alt="Laddar..." src="${blog.image_url}">
        <div class="news-card-content">
            <h3>${blog.title}</h3>
            <p>${blog.summary.substring(0, 100)}...</p>
            <a href="${blog.url}" target="_blank">Full blog</a>
        </div>
        `;
        container.appendChild(div);
    })
} else container.innerHTML = "Hittar inget..."
}

async function fetchReports() {
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/reports/?&limit=4&offset=0`)
    const data = await res.json()
    const container = document.getElementById('reports-container')
    container.innerHTML = ''

    if(data.results.length != 0) {
    data.results.forEach(report => {
        const div = document.createElement('div')
        div.className = 'news-card'
        div.onclick = function () {window.open(report.url, '_blank')}
        div.innerHTML = `
        <div class="news-card-content">
            <h3>${report.title}</h3>
            <p>${report.summary.substring(0, 200)}...</p>
            <a href="${report.url}" target="_blank">Full report</a>
        </div>
        `;
        container.appendChild(div);
    })
} else container.innerHTML = "Hittar inget..."
}

function tglLogin() {
    const loginForm = document.querySelector('.login-form');
    loginForm.classList.toggle('hidden');
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
        loggedIn = true;
        loggedInUser = username;
        // Hämta följda ord från servern:
        const userData = JSON.parse(await (await fetch('/login.json')).text());
        const user = userData.login.find(u => u.username === username);
        followedWords = user && user.followedWords ? user.followedWords : [];
        updateLoginButton();
        document.querySelector('.login-form').classList.add('hidden');
    } else {
        alert(data.message || 'Login failed');
    }
}

function updateLoginButton() {
    const loginBtn = document.querySelector('.login-form button[type="submit"]');
    if (loggedIn) {
        loginBtn.textContent = "Log out";
        loginBtn.onclick = handleLogout;
        document.getElementById('followed-words-container').style.display = 'block';
        showFollowedWordsUI();
    } else {
        loginBtn.textContent = "Log in";
        loginBtn.onclick = null;
        document.getElementById('followed-words-container').style.display = 'none';
    }
}

function handleLogout(event) {
    event.preventDefault();
    loggedIn = false;
    updateLoginButton();
    alert('Successfully logged out');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

async function handleRegister() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    console.log(data);
    if (data.success) {
        alert('Registrering lyckades!');
    } else {
        alert('Registrering misslyckades!');
    }
}

function showFollowedWordsUI() {
    const section = document.getElementById('followed-section');
    const wordsList = document.getElementById('followed-words-list');
    if (loggedIn) {
        section.style.display = 'block';
        wordsList.innerHTML = followedWords.map((word, i) => `
            <span class="followed-word" style="display:inline-block; margin:0 8px 8px 0; padding:4px 8px; background:#eee; border-radius:16px; position:relative;">
                ${word}
                <span onclick="removeFollowedWord(${i})" style="background:#d32f2f; color:white; border-radius:50%; padding:0 6px; margin-left:6px; cursor:pointer; font-weight:bold; position:relative; top:-1px;">×</span>
            </span>
        `).join('');
    } else {
        section.style.display = 'none';
        wordsList.innerHTML = '';
        document.getElementById('followed-articles-container').innerHTML = '';
    }
    fetchFollowedArticles();
}

function showForumButton() {
    
}

// Visa/dölj sektionen vid login/logout
function updateLoginButton() {
    const loginBtn = document.querySelector('.login-form button[type="submit"]');
    if (loggedIn) {
        loginBtn.textContent = "Log out";
        loginBtn.onclick = handleLogout;
        showFollowedWordsUI();

    } else {
        loginBtn.textContent = "Log in";
        loginBtn.onclick = null;
        showFollowedWordsUI();
    }
}

function addFollowedWord(event) {
    event.preventDefault();
    const wordInput = document.getElementById('follow-word-input');
    const word = wordInput.value.trim();
    if (word && !followedWords.includes(word)) {
        followedWords.push(word);
        wordInput.value = '';
        showFollowedWordsUI();
        saveFollowedWords();
    }
}

async function saveFollowedWords() {
    if (!loggedInUser) return;
    await fetch('/api/followedWords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loggedInUser, followedWords })
    });
}

function removeFollowedWord(index) {
    followedWords.splice(index, 1);
    showFollowedWordsUI();
    saveFollowedWords();
}

async function fetchFollowedArticles() {
    const container = document.getElementById('followed-articles-container');
    container.innerHTML = '';
    if (!loggedIn || followedWords.length === 0) return;

    let allArticles = [];
    for (const word of followedWords) {
        const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?title_contains=${encodeURIComponent(word)}&summary_contains=${encodeURIComponent(word)}&limit=8&offset=0`);
        const data = await res.json();
        if (data.results) {
            allArticles = allArticles.concat(data.results);
        }
    }
    const uniqueArticles = [];
    const ids = new Set();
    for (const article of allArticles) {
        if (!ids.has(article.id)) {
            ids.add(article.id);
            uniqueArticles.push(article);
        }
    }

    if (uniqueArticles.length > 0) {
        uniqueArticles.forEach(article => {
            const div = document.createElement('div');
            div.className = 'news-card';
            div.onclick = function () { window.open(article.url, '_blank'); };
            div.innerHTML = `
                <img src="${article.image_url}">
                <div class="news-card-content">
                    <h3>${article.title}</h3>
                    <p>${article.summary.substring(0, 100)}...</p>
                    <a href="${article.url}" target="_blank">Full article</a>
                </div>
            `;
            container.appendChild(div);
        });
    } else {
        container.innerHTML = "<p>Inga artiklar hittades.</p>";
    }
}

fetchLatestNews();
fetchArticles();;
fetchBlogs();
fetchReports();
fetchReports();