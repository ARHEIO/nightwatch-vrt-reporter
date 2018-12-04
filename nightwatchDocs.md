# Nightwatch Considerations

- If you use `.assert` and the test fails, it cancels the rest of the tests
- There is an empty reporter file because otherwise, Nightwatch  will use the default JUnit test reporter, which doesn't output anything because we don't make any default assertations, and is also XML
- `nightwatchGlobals.js` contains the lifecycle callbacks for the tests; the `afterEach()` functions run after a `module.export`

# I wish

- There was a way to generate tests for the different screen widths off one set of tests to reduce the amount of files
- We had a custom reporter to be able to display all differing screenshots next to each other