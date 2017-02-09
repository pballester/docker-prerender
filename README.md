# docker-prerender

## Description
Dockerfile to build the prerender container image with redis cache.

## Configuration

### Prerender

Plugins enabled by default:
- sendPrerenderHeader (*prerender*)
- removeScriptTags (*prerender*)
- httpHeaders (*prerender*)
- redisCache (*custom - lib/redisCache*)
- viewPort (*custom - lib/viewPort*)

See [Prerender](https://github.com/prerender/prerender) for more documentation.

### Redis Cache

  Configuration by environment variables:

  - **REDIS_URL** - Defaults to *redis://127.0.0.1:6379*, redis connection string.
  - **PAGE_TTL** - Defaults to *15* days, TTL on keys set in redis.
  - **PARAMS_TO_IGNORE** - Defaults to *[]*, query parameters separated by
    whitespace to be ignored, when ignoring a query parameter, we will cache and
    serve a specified URL without using the ignored query parameter.

### ViewPort

  Configuration by environment variables:

  - **VIEWPORT_WIDTH** - Defaults to 1024.
  - **VIEWPORT_HEIGHT** - Defaults to 1024.
