module.exports = function(eleventyConfig) {

  // get static files into the publish-able root
  eleventyConfig.addPassthroughCopy({"source/_static/*.*": "/"});
  eleventyConfig.addPassthroughCopy({"source/_static/img": "img"});
  eleventyConfig.addPassthroughCopy({"source/_static/css": "css"});
  eleventyConfig.addPassthroughCopy({"source/_static/js": "js"});
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
