This is a work in progress LaTeX "theme" for [JSON
resumes](https://jsonresume.org/).

## TODO

- Fall back nicely when certain fields aren't included in the resume. Right now
  this is somewhat the case, but since the official schema doesn't list _any_
  fields as required it's hard to tell what cases should be covered.
- Make date formats configurable as options for the `makeTheme` function,
  since they're probably pretty common things for people to want to change.
