(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("q") || "").trim();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '<a class="cover-link" href="' + escapeHtml(item.url) + '">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="play-dot">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<a class="card-title" href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a>',
      '<p>' + escapeHtml(item.summary) + '</p>',
      '<div class="card-meta"><span>' + escapeHtml(item.meta) + '</span></div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function run() {
    var host = document.getElementById("searchResults");
    var title = document.getElementById("searchTitle");
    var count = document.getElementById("searchCount");
    var input = document.getElementById("pageSearchInput");
    var query = getQuery();
    var source = window.SiteSearch || [];
    var normalized = query.toLowerCase();
    var results = query
      ? source.filter(function (item) {
          return item.keywords.toLowerCase().indexOf(normalized) !== -1;
        })
      : source.slice(0, 48);

    if (input) {
      input.value = query;
    }

    if (title) {
      title.textContent = query ? "搜索结果：" + query : "推荐内容";
    }

    if (count) {
      count.textContent = results.length + " 部内容";
    }

    if (host) {
      host.innerHTML = results.slice(0, 120).map(card).join("");
      if (!results.length) {
        host.innerHTML = '<div class="article-card"><h2>暂无匹配内容</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p></div>';
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
