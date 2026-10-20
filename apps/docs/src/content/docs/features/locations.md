---
title: Locations and maps
description: How places are stored with PostGIS, deduplicated, searched by distance and shown on maps.
---

## Storage

A `location` row has a display `name`, an `apiId` (the geocoder's identifier for the place) and `coordinates`, a
PostGIS `geography(POINT, 4326)` with a GiST index. Tournaments, stages and groups point at locations through
`locationId`.

User locations are not stored. Distance searches take the user's coordinates as query parameters instead.

## Creating locations

`POST /locations` (any signed-in user) takes `{ name, apiId, lat, lng }`. If a location with the same `apiId`
already exists, that one is returned instead of creating a duplicate, so picking the same place twice reuses one
row.

`PATCH /locations/:id` and `DELETE /locations/:id` are also open to any signed-in user.

## Querying

| Endpoint             | Purpose                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `GET /locations`     | Filter by `name`, `apiId`, or by distance with `lat`, `lng` and `distance` in **metres** (`ST_DWithin`) |
| `GET /locations/:id` | One location, coordinates as GeoJSON                                                                    |
| `GET /locations/map` | Every location as `{ id, name, coordinates: [lng, lat] }` for map markers                               |

Note the different units: `/locations` takes metres, while `GET /lfp/groups` takes kilometres and converts them.

## In the web app

- **Geocoding**: location search uses the Photon geocoder (`NEXT_PUBLIC_GEOCODER_URL`, default
  `https://photon.komoot.io`), wrapped in `src/api/geocoding`. `useLocationPicker` turns a result into the request
  body above.
- **Maps**: MapLibre GL renders OpenFreeMap vector tiles. Light and dark styles come from
  `NEXT_PUBLIC_MAP_STYLE_URL` and `NEXT_PUBLIC_MAP_STYLE_URL_DARK`, and the map follows the app theme.
- No API keys are needed for either. For heavy use, point the variables at your own Photon and tile servers.
