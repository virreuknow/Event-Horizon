let limitThing = 4;
let oddOrEven = 1
let button = document.getElementById('buttonArticle');
let input = document.getElementById('input')
let articleContent = 0

function moreFunc() {
    limitThing = (oddOrEven%2 == 0) ? 4 : 8;
    fetchArticles();
    (button.style.transform) = (oddOrEven%2 == 0) ? ("scale(2) rotate(0deg)") : ("scale(2) rotate(-90deg)")
    oddOrEven += 1;
}

function searchNews() {
    articleContent = `title_contains=${input.value}`
    fetchArticles()
}

async function fetchLatestNews() {
    const [articlesRes, blogsRes] = await Promise.all([ //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
      fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=1&offset=0'),
      fetch('https://api.spaceflightnewsapi.net/v4/blogs/?limit=1&offset=0') //https://api.spaceflightnewsapi.net/v4/docs/
    ]);

    const articleData = await articlesRes.json();
    const blogData = await blogsRes.json();
    console.log(articleData.results[0].published_at)

    const latest = ((articleData.results[0].published_at) > (blogData.results[0].published_at)) ? (articleData.results[0]) : (blogData.results[0])



    document.getElementById('breaking-news').innerHTML = `
      <a href="${latest.url}" target="_blank" style="color:white;text-decoration:none;display: block;">🚨 ${latest.title}</a>
    `;
}

async function fetchArticles() {
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/articles/?${articleContent}&limit=${limitThing}&offset=0`)
    const data = await res.json()
    const container = document.getElementById('article-container')
    container.innerHTML = ''
    if(data.results.length != 0) {
    

    data.results.forEach(artikel => {
        const div = document.createElement('div')
        div.className = 'news-card'
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
    const res = await fetch(`https://api.spaceflightnewsapi.net/v4/blogs/?limit=${limitThing}&offset=0`)
    const data = await res.json()
    const container = document.getElementById('blogs-container')

    data.results.forEach(blog => {
        const div = document.createElement('div')
        div.className = 'news-card'
        div.innerHTML = `
        <img src="${blog.image_url}">
        <div class="news-card-content">
            <h3>${blog.title}</h3>
            <p>${blog.summary.substring(0, 100)}...</p>
            <a href="${blog.url}" target="_blank">Läs mer</a>
        </div>
        `;
        container.appendChild(div);
    })
}

fetchLatestNews();
fetchArticles();
fetchBlogs();