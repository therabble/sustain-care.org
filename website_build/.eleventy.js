
function icon (name, size = 32) {
  // size is from Bulma (here: https://bulma.io/documentation/elements/image/)
  // and can be 16 24 32 48 64 96 128
  return `<figure class="image is-${size}x${size}"><img src="/img/icons/${name}.svg" alt="${name} icon"></figure>`
};

function social_link_icon(link, clss = "", size = 32) {
  // send in css class string for clss
  const look_for = ["facebook", "instagram", "linkedin", "twitter", "email"];
  let name = look_for.find(n => link.toLowerCase().includes(n));
  // option for an unknown link type...
  let linked_markup;
  if (name === undefined) {
    linked_markup = link;
    clss += " is-small";
    name = link;
  } else
    linked_markup = icon(name, size);

  return `<a href="${link}" target="_blank" class="${clss}" title="navigate to ${name}...">${linked_markup}</a>`
};

module.exports = function (eleventyConfig) {
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

  // 'shortcodes' for using in templates

  // icon: use {% icon 'facebook' 64 %} for example
  eleventyConfig.addShortcode("icon", icon);

  // social_link_icon: use {% isocial_link_icon 'http://facebook.com/something_real_here' "myCssClasses" 64 %} for example
  eleventyConfig.addShortcode("social_link_icon", social_link_icon);

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
