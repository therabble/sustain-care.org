// Code that fetches projects from Google Spreadsheet
const fetch = require('node-fetch');
const parse = require('csv-parse/lib/sync');
const assert = require('assert');
const slugify = require('slugify'); // pulled in by eleventy

// ripped off from eleventy, so we end up with the same kind of slugs
function toSlug(str) {
  return slugify(str, { replacement: '-', lower: true });
}

// where we store our "secret" url data source
const secrets = require('./secrets');
const gd = require('../gdrive');

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

async function makeImageObject(url, filename_prefix, savedir) {
  const id = gd.getIdFromURL(url);
  const obj = await gd.getImageMetadata(id);
  obj.original_url = url;
  obj.filename = `${filename_prefix}.${obj.fileExtension}`;
  gd.downloadImage(id, obj.filename, savedir);
  return obj;
}

async function gather_institutions(row, columns) {
  const institutions = [];
  for (let i = 0; i < 5; i += 1) {
    const inst_name = row[columns.indexOf(`institution_${i}_name`)];
    if (inst_name) {
      const iobj = {
        name: inst_name,
        role: row[columns.indexOf(`institution_${i}_role`)] || null,
        url: row[columns.indexOf(`institution_${i}_url`)] || null,
        logo: null,
      };
      if (row[columns.indexOf(`institution_${i}_logo_url`)])
        iobj.logo = {
          // finishing this outside of this function :-(
          original_url: row[columns.indexOf(`institution_${i}_logo_url`)],
        };
      institutions.push(iobj);
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

async function make_record_object(row, columns) {
  // given a row, make a nice js object
  const record_obj = {
    submit_time: row[columns.indexOf('submit_time')],
    name: row[columns.indexOf('name')],
    slug: toSlug(row[columns.indexOf('name')]),
    description: row[columns.indexOf('description')],
    representative_name: row[columns.indexOf('representative_name')],

    // ones that are not required or'd with null if they're empty
    main_url: row[columns.indexOf('main_url')] || null,
    fundraising_url: row[columns.indexOf('fundraising_url')] || null,
    fundraising_email: row[columns.indexOf('fundraising_email')] || null,
    social_urls:
      row[columns.indexOf('social_list')].split(',').map(u => u.trim()) || null,

    // couple of fancier ones
    institutions: await gather_institutions(row, columns),
    tags: gather_tags(row[columns.indexOf('tags_list')]),

    // image placeholders
    logos: [],
    representative_images: [],
  };

  // bunch of crufty image work...

  const savedir = `../docs/${record_obj.slug}`;

  // logo images work
  if (row[columns.indexOf('logo_url')]) {
    const logo_urls = row[columns.indexOf('logo_url')].split(', ');
    for (let i = 0; i < logo_urls.length; i += 1) {
      const obj = await makeImageObject(logo_urls[i], `logo${i + 1}`, savedir);
      record_obj.logos.push(obj);
    }
  }

  // representative images work
  if (row[columns.indexOf('representative_avatar_url')]) {
    const rep_urls = row[columns.indexOf('representative_avatar_url')].split(
      ', '
    );
    for (let i = 0; i < rep_urls.length; i += 1) {
      const obj = await makeImageObject(
        rep_urls[i],
        `representative${i + 1}`,
        savedir
      );
      record_obj.representative_images.push(obj);
    }
  }

  // institutions images
  for (let i = 0; i < record_obj.institutions.length; i += 1) {
    if (record_obj.institutions[i].logo) {
      record_obj.institutions[i].logo = await makeImageObject(
        record_obj.institutions[i].logo.original_url,
        `logo.institution${i + 1}`,
        savedir
      );
    }
  }

  // stick us in the by-tag lut:
  record_obj.tags.forEach(tag => {
    if (!(tag in tagged_records)) tagged_records[tag] = [];
    tagged_records[tag].push(record_obj);
  });

  return record_obj;
}

async function make_records(rows, columns) {
  let records = [];
  rows.slice(1);
  for (const row of rows) {
    if (row[columns.indexOf('_publish')] === 'Y') {
      const obj = await make_record_object(row, columns);
      records.push(obj);
    }
  }
  // sort them so the example project is first, if it's there...
  records = example_to_first(records);
  return records;
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

  return {
    records: await make_records(raw_rows, COLUMN_ORDER),
    tags: all_known_tags.sort(),
    records_by_tag: tagged_records,
    now: Date(), // just a hack to get the time this data was built into templates
    public_form_url: 'https://forms.gle/Qc7MZvDKt2s2nJgq7',
  };
};
