module.exports = function(eleventyConfig) {

  // get static files into the publish-able root
  const static_files = ['robots.txt', 'README.md', 'CNAME'];
  static_files.forEach(sf => {
    // for some reason 11ty wasn't just picking these files up with a glob match, so
    // squirting them in one by one...
    const ob = {}
    ob[`static/${sf}`] = `/${sf}`;
    eleventyConfig.addPassthroughCopy(ob);
  });
  // eleventyConfig.addPassthroughCopy({"static/CNAME": "/CNAME"});

  // and some static dirs
  eleventyConfig.addPassthroughCopy({ "static/img": "img" });
  eleventyConfig.addPassthroughCopy({"static/css": "css"});
  eleventyConfig.addPassthroughCopy({"static/js": "js"});
  //console.log(eleventyConfig);

  return {
    dir: {
      input: "source",
      output: "../docs",
      includes: "_layouts",
      layouts: "_layouts",
      data: "../data"
    },
  };
};
