const projects = require('./data/projects');

projects()
  .then(({ records, tags }) => {
    console.log(tags);
    return Promise.all(records);
  })
  .then(records => JSON.stringify(records, null, 2))
  .then(json => console.log(json));
