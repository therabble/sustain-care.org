# BUGS!

## people stuff, data model
1. Situation like Morris; they didn't grok the notion of associated instittuions
1. tags don't seem to be working conceptually

## data / wiring
1. People can put non-urls into social links; breaks at layout
1. Newlines in description text need a solution
1. opengraph tags for detail pages should be filled with real data, not the generic; an 11ty inheritence problem

## markup / templates
1. donate link(s) dont' go anywhere
1. various contact us links need doing
1. detail view isn't centered (needs a .container somewheres)
1. maybe need a favicon.ico?

## to-do
1. store json in build process for use later by client-side code
1. implement some kind of e-tag thing to not waste parsing old data


### images meta-to-do
1. get google api calls working with just api key rather than oauth
1. see if one key can also get us sheets/forms
1. store a json clod for each image:
   1. data from api
   1. etag
   1. md5sum?
1. come up with sane filename strategy, and where to park the images
1. also store thumbnail(s)
1. probably change og:image for detail pages
