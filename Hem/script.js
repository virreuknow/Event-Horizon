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


fetchLatestNews();