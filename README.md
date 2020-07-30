# Telenode
Simple telegram bot on a nodejs
==============================

Start
-----
* Run `mongodb`
    * `docker run -p 27017:27017 --name some-mongo -e MONGO_INITDB_ROOT_USERNAME=root -e MONGO_INITDB_ROOT_PASSWORD=toor mongo` - first way
    * `docker-compose up` - second way
    * `mongo "mongodb://localhost:27017" -u root -p toor` - connect to the database to make sure everything works
* `npm i` - installing dependencies
* Create `add-token.sh` with content `export TOKEN='<your-key>'`
    * `source add-token.sh`
* `node src/server.js` - entry point
