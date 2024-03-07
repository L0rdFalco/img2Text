const SitemapGenerator = require('sitemap-generator');

// create generator
const generator = SitemapGenerator('https://puzzlebook-creator-online.onrender.com/', {
    stripQuerystring: false
});

// register event listeners
generator.on('done', () => {
    console.log("sitemaps created");
});

// start the crawler
generator.start();