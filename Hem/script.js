let limitThing = 4;
let limitthing = 4
let oddOrEven = 1
let oddoreven = 1
let buttonArc = document.getElementById('buttonArticle');
let buttonBlog = document.getElementById('buttonBlog');
let input = document.getElementById('input')
let articleContent = 0
let articleContent2 = 0

function moreFunc(btn) {
    if (btn === 'article') {
        limitThing = (oddOrEven % 2 === 0) ? 4 : (2*limitThing);
        buttonArc.innerHTML = (oddOrEven % 2 === 0) ? "Visa mer" : "Visa mindre";
        oddOrEven += 1;
        fetchArticles();
    } else if (btn === 'blog') {
        limitthing = (oddoreven % 2 === 0) ? 4 : (2*limitthing);
        buttonBlog.innerHTML = (oddoreven % 2 === 0) ? "Visa mer" : "Visa mindre";
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
            <a href="${artikel.url}" target="_blank">Läs mer</a>
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
            <a href="${blog.url}" target="_blank">Läs mer</a>
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
            <a href="${report.url}" target="_blank">Läs mer</a>
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

fetchLatestNews();
fetchArticles();
fetchBlogs();
fetchReports();