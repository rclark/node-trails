# db module

Control interactions with CouchDB. Rely on nano as much as possible, so this primarily is about database maintenance as opposed to data I/O.

- `setup` is used to make sure that CouchDB is properly configured. It should contain three databases:
    - `osmcache`: contains features pulled from OSM
    - `routes`: contains features that represent "routes", which are essentially named, described trails
    - `segments`: contain GeoJSON features that make up the network of trails