// Code that fetches projects from Google Spreadsheet
const fetch = require('node-fetch');
const parse = require('csv-parse/lib/sync');
const assert = require('assert');

// where we store our "secret" url data source
const secrets = require('./secrets');

// the order of the columns in the output as of 5/13/2010 @ 4pm.
const COLUMN_ORDER = [
  // by convention, columns tagged with a _ prefix should not be published
  'submit_time',
  '_submit_email',
  'name',
  'main_url',
  'social_list',
  'description',
  'tags_list',
  '_suggested_tags_list',
  'logo_url',
  'representative_name',
  '_representative_email',
  '_representative_phone',
  'representative_avatar_url',
  '_has_institutions',
  'institution_1_name',
  'institution_1_role',
  'institution_1_url',
  '_institution_1_email',
  'institution_1_logo_url',
  '',
  'institution_2_name',
  'institution_2_role',
  'institution_2_url',
  '_institution_2_email',
  'institution_2_logo_url',
  '',
  'institution_3_name',
  'institution_3_role',
  'institution_3_url',
  '_institution_3_email',
  'institution_3_logo_url',
  '',
  'institution_4_name',
  'institution_4_role',
  'institution_4_url',
  '_institution_4_email',
  'institution_4_logo_url',
  '',
  'institution_5_name',
  'institution_5_role',
  'institution_5_url',
  '_institution_5_email',
  'institution_5_logo_url',
  '',
  'fundraising_url',
  'fundraising_email',
  '_notes',
  '_publish',
];

const all_known_tags = [];

// store references to record objects by tag in here
const tagged_records = {};

function gather_institutions(row, columns) {
  const institutions = [];
  for (let i = 1; i < 6; i += 1) {
    const inst_name = row[columns.indexOf(`institution_${i}_name`)];
    if (inst_name) {
      institutions.push({
        name: inst_name,
        role: row[columns.indexOf(`institution_${i}_role`)] || null,
        url: row[columns.indexOf(`institution_${i}_url`)] || null,
        logo_url: row[columns.indexOf(`institution_${i}_logo_url`)] || null,
      });
    }
  }
  return institutions;
}

function gather_tags(tag_string) {
  const this_tags = [];
  if (tag_string) {
    tag_string.split(',').map(function(t) {
      const tag = t.trim();
      if (!this_tags.includes(tag)) this_tags.push(tag);
      if (!all_known_tags.includes(tag)) all_known_tags.push(tag);
    });
    return this_tags;
  }
}

function example_to_first(records) {
  // just want this record to be first
  const index = records.findIndex(
    r => r.name === 'Example Community Meals Project'
  );
  if (index) {
    const r = records.splice(index, 1);
    records.splice(0, 0, r[0]);
  }
  return records;
}

// TO-DO stuff:
// ? 1. What about when there are newlines, for example in the description?
// ? 2. How to handle the image files and other URLs to content?
// ? 3. Need a publish/no-publish flag on the data source so things don't get by us that shouldn't

function to_record_object(row, columns) {
  // given a row, make a nice js object
  // but only if the _publish column is not empty...
  if (row[columns.indexOf('_publish')] === null) return null;
  const record_obj = {
    submit_time: row[columns.indexOf('submit_time')],
    name: row[columns.indexOf('name')],
    description: row[columns.indexOf('description')],
    representative_name: row[columns.indexOf('representative_name')],

    // ones that are not required or'd with null if they're empty
    main_url: row[columns.indexOf('main_url')] || null,
    logo_url: row[columns.indexOf('logo_url')] || null,
    representative_avatar_url:
      row[columns.indexOf('representative_avatar_url')] || null,
    fundraising_url: row[columns.indexOf('fundraising_url')] || null,
    fundraising_email: row[columns.indexOf('fundraising_email')] || null,
    social_urls:
      row[columns.indexOf('social_list')].split(',').map(u => u.trim()) || null,
    // couple of fancier ones
    institutions: gather_institutions(row, columns),
    tags: gather_tags(row[columns.indexOf('tags_list')]),
  };

  // stick us in the by-tag lut:
  record_obj.tags.forEach(tag => {
    if (!(tag in tagged_records)) tagged_records[tag] = [];
    tagged_records[tag].push(record_obj);
  });

  // console.log(`logo_url: ${record_obj.logo_url}`);
  // console.log(
  //   `representative_avatar_url: ${record_obj.representative_avatar_url}`
  // );
  // record_obj.institutions.forEach(i =>
  //   console.log(`institution logo_url: ${i.logo_url}`)
  // );
  // console.log('-------------------------------');
  return record_obj;
}

module.exports = async function() {
  const response = await fetch(secrets.initiatives_data_source);
  const raw_sheet = await response.text();
  const raw_rows = parse(raw_sheet).slice(1); // first row is metadata from the form
  // console.log(raw_rows[0]);

  // make sure the current first row is the same as our COLUMN_ORDER
  try {
    assert.deepEqual(raw_rows[0], COLUMN_ORDER);
  } catch (AssertionError) {
    console.log('\n\nCOLUMN_ORDER:');
    console.log(COLUMN_ORDER);
    console.log('\n\nFirst row in the data source:');
    console.log(raw_rows[0]);
    console.log(
      'Retrieved first row and expected COLUMN_ORDER differ! See above'
    );
    throw new Error('Mismatched columns; exit');
  }

  // ok, to business...
  let record_objects = raw_rows
    .slice(1) // remove our labels in there
    .map(row => to_record_object(row, COLUMN_ORDER))
    .filter(record => record != null); // this filters out empty rows from unpublished flag
  //   console.log(records);
  //   console.log(records[0].institutions[1]);
  console.log(`Found (${record_objects.length}) records from CSV url.`);
  all_known_tags.sort();
  console.log(`Found tags: (${all_known_tags})`);

  // sort them so the example project is first, if it's there...
  record_objects = example_to_first(record_objects);

  return {
    records: record_objects,
    tags: all_known_tags,
    records_by_tag: tagged_records,
    now: Date(), // just a hack to get the time this data was built into templates
    public_form_url: 'https://forms.gle/Qc7MZvDKt2s2nJgq7',
  };
};
