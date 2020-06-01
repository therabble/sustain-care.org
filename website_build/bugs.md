# BUGS!

## people stuff, data model
1. Situation like Morris; they didn't grok the notion of associated instittuions
1. tags don't seem to be working conceptually

## data / wiring
1. People can put non-urls into social links; breaks at layout
1. Newlines in description text need a solution
1. opengraph tags for detail pages should be filled with real data, not the generic; an 11ty inheritence problem

## markup / templates
1. detail view isn't centered (needs a .container somewheres)
2. maybe need a favicon.ico?

## to-do
1. implement some kind of e-tag thing to not waste parsing old data


### images meta-to-do
1. see if one key can also get us sheets/forms
1. store a json clod for each image:
   1. X data from api
   1. etag
   1. md5sum?
1. also store thumbnail(s)
1. probably change og:image for detail pages
