# perfo

perfo is an app that shows build performance from CI providers.

## Usage

### Prerequisites

You will need the following things properly installed on your computer.

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 11+
- [Yarn](https://yarnpkg.com/)
- [Ember CLI](https://ember-cli.com/)

### Installation

- `git clone git@github.com:peopledoc/perfo`
- `cd perfo`
- `yarn`

### Running

Note that perfo includes not only a front ember app, but also an express server
that is used to query CI providers for data and store user preferences.

To reduce strain on external CI APIs (and maybe avoid rate limiting), the server
caches data requested from them in a filesystem-based cache. You can control
that cache with environment variables.

You will need the following environment variables to run the app:

- `PERFO_CIRCLECI_TOKEN`: a [CircleCI API token][cciapi]

Optionally, you may also set the following environment variables:

- `PERFO_CACHE_VALIDITY`: the server cache validity in milliseconds; defaults to
  30 minutes
- `PERFO_CACHE_PRUNE_INTERVAL`: the interval at which the whole cache content is
  checked for validity and expired items are removed; defaults to the cache
  validity value
- `PERFO_DATA_DIR`: the path where the server stores cache and stored data;
  defaults to a `data` directory at the project root
- `PERFO_LOG_FORMAT`: format for [morgan][morgan] logs; defaults to `dev`
- `PERFO_MAX_BUILD_AGE`: maximum age (in milliseconds) of builds to show data
  from; defaults to 3 months
- `PERFO_ORG_FILTER`: if set, only make projects visible when their org is set
  to this value; defaults to no filter
- `PERFO_PORT`: TCP port the server listens on; only used in production (the
  development server will always use the port passed to `ember serve` or 4200 as
  a default value); defaults to 4200
- `PERFO_ROOT_URL`: the root URL where the app is served; defaults to `/`

#### Development

- `ember serve`
- Visit your app at [http://localhost:4200](http://localhost:4200)

#### Production

You will need a webserver that is capable of serving static files from a
directory and proxying requests to a locally-running HTTP server.

- Build the app: `ember build --environment=production`
  - make sure the `PERFO_ROOT_URL` environment is set during the build to the
    value that will be used when executing the server
  - set up your webserver to serve the `dist` directory (or whichever directory
    you told `ember build` to output into) at the root URL.
- Run `server/standalone.js` with node 11+
  - make sure environment variables are set properly
  - make sure the user running the server can read and write into the directory
    pointed by `PERFO_DATA_DIR`
  - you may want to use a process manager to ensure it keeps running.
  - set up your webserver to proxy requests that did not hit a static file to
    where the server is listening (̀`localhost:PERFO_PORT`).

### Custom graphs

perfo automatically displays a build duration graph for projects (with one line
per build job) over time. Users can also define custom graphs for each project.

To use custom graphs, your build jobs must generate JSON artifacts that contain
an array of data points, each data point being an object with a string `label`
and a numeric `value`.

When defining a custom graph, users set the following properties:

- A title for the graph
- The build job name that generates the artifacts
- A regexp for branches where the graph applies
- A regexp for the name of the artifact to look for
- A formatter for data values (none, duration, file size)
- A graph type (line, smooth line, stacked area)

When drawing the graph, perfo will look for all builds that match the job name
and have an artifact that matches the regexp. It will fetch data for all those
artifacts and draw a curve for each distinct `label` value found in those.

For example, you could imagine having a custom graph drawing the evolution of
your static asset sizes over time by having a build job generate a JSON artifact
with the following content:

```js
;[
  { label: 'vendor.js', value: 12345 },
  { label: 'vendor.css', value: 23456 },
  { label: 'app.js', value: 34567 },
  { label: 'app.css', value: 45678 }
]
```

### Extending perfo

#### Adding new CI providers

perfo comes with a CircleCI provider. You may add new providers to the
`server/providers` directory and they will be used automatically by the server
(after a restart).

##### Provider API

A provider is a module that exports a single provider factory function. This
function must return an object with the methods as described below.

All methods must be `async` (or return a promise). Objects returned may have
additional keys than those specified below, but to ensure there are no name
clashes with properties that may be added later to the provider API, you must
prefix any "private" property with an underscore.

**`async info()`: return information about the provider.**

Must return an object with the following keys:

- `account`: an identifier for the provider user (user ID, e-mail...)
- `connected`: boolean indicating whether the provider is able to reach its data
  source
- `icon` (optional): URL for an icon to display for the provider
- `name`: a human-readable name for the data source

**`async projects()`: return the list of projects available**

Must return an array of project objects, with the following keys:

- `id`: a unique ID (within the scope of the provider) for the project
- `name`: a human-readable name for the project
- `branches`: an array of branch names for the project

**`async builds(project, branch)`: return the list of available builds for a
branch of a project**

Parameters:

- `project` is the project ID
- `branch` is the branch name

Must return an array of build objects, with the following keys:

- `id`: a unique ID (within the scope of the project) for the build
- `job`: a job name for the build (eg. "test", "build"...)
- `start`: the starting date for the build as an ISO string
- `duration`: the duration of the build in milliseconds
- `subject`: the subject of this specific build (eg. a commit message)
- `revision`: the VCS revision for this specific build (eg. a commit SHA-1)

**`async customGraphData(project, branch, jobName, artifactMatches)`: return a
list of datasets to draw a custom graph for a branch of a project**

Parameters:

- `project` is the project ID
- `branch` is the branch name
- `jobName` is used to filter builds to extract data from
- `artifactRegex` is used to filter artifact names to extract data from

Must return an array of dataset objects, one per build that matches the
`jobName` parameter and has an artifact whose name matches `artifactRegex`. If
several artifacts from a build match, use the first one.

Dataset objects have the following keys:

- `date`: start date for the build
- `subject`, `revision`: same values as the corresponding keys in the build
- `points`: data from the first matching artifact in the build; should be an
  array of objects with a string `label` and a numeric `value`.

##### Injected services

Provider factories will receive an `injections` object as their first parameter.
This object contains various services that providers may want to use, most
notably the following:

**`config`: configuration data**

Contains the following keys:

- `orgFilter`: organization filter to filter the project list
- `maxBuildAge`: maximum age in milliseconds of project builds to consider

**`async cache(key, async getter())`: get data from the server cache**

Looks for a cached value with `key` as a key, and return it.

The key namespace is shared, so you should prefix your cache keys with the
provider name. Use `path.join()` to build keys with several parts.

If the key is not available or the cache has expired, `getter()` will be called
and its return value will be stored in the cache and returned.

**`store`: local filesystem-backed data store**

Stores data on the filesystem in a directory structure as JSON files. Any data
you store should be JSON-serializable.

The key namespace is shared, so you should prefix your store keys with the
provider name. Use `path.join()` to build keys with several parts.

The store has the following methods:

- `async getItem(key)`: gets an item from the store or return undefined
- `async setItem(key, value)`: set an item in the store, overriding any existing
  data
- `async delItem(key)`: remove an item from the store
- `async keys(path = '')`: list all keys in the store in a given path

> _Note: using cache vs. store?_
>
> When requesting data from a remote CI provider API, you should use the cache
> for resources that change over time (eg. project list, project builds) and
> the store for resources that do not change (eg. payload for a specific build
> artifact).

**`logger`: very simple logging facility**

Has the following methods:

- `debug(item, ...)`: logs items to the console
- `error(context, error)`: logs an error to the console

---

[cciapi]: https://circleci.com/account/api
[morgan]: https://github.com/expressjs/morgan
