async function fetchLatestNews() {
    const [articlesRes, blogsRes] = await Promise.all([ //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
      fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=1&ordering=-published_at'),
      fetch('https://api.spaceflightnewsapi.net/v4/blogs/?limit=1&ordering=-published_at') //https://api.spaceflightnewsapi.net/v4/docs/
    ]);

    const articleData = await articlesRes.json();
    const blogData = await blogsRes.json();

    let latest = articleData.results.concat(blogData.results)
      .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))[0];

    document.getElementById('breaking-news').innerHTML = `
      <a href="${latest.url}" target="_blank" style="color:white;text-decoration:none;display: block;">🚨 ${latest.title}</a>
    `;
}


fetchLatestNews();