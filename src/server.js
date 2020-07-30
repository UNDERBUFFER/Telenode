
const TOKEN = process.env.TOKEN
const urlTemplate = `https://api.telegram.org/bot${TOKEN}`
const patterns = require('./patterns')
const https = require('https')
const { MongoClient } = require('mongodb')
const mongoClient = new MongoClient(`mongodb://${'root'}:${'toor'}@localhost:27017/`, {poolSize: 10, bufferMaxEntries: 0, reconnectTries: 5000, useNewUrlParser: true, useUnifiedTopology: true, useNewUrlParser: true})

async function getUpdates(offset=null) {
    offset = offset != null ? offset = `?offset=${offset}` : ''
    return new Promise(resolve => {
        https.get(`${urlTemplate}/getUpdates` + offset, response => {
            let data = ''

            response.on('data', chunk => {
                data += chunk
            })

            response.on('end', () => {
                const dataObj = JSON.parse(data)
                resolve(dataObj)
            })
        })
    })
}

function sendMessage(chat_id, text) {
    https.get(`${urlTemplate}/sendMessage?chat_id=${chat_id}&text=${text}`)
}

async function main() {
    const client = await mongoClient.connect()
    let offset = null
    let necessaryData = {}
    while (true) {
        const dataObj = await getUpdates(offset)
        try {
            // TODO: unusual messages
            necessaryData = {
                update_id: dataObj.result[0].update_id,
                username: dataObj.result[0].message.from.username,
                chat_id: dataObj.result[0].message.chat.id,
                text: dataObj.result[0].message.text
            }
        }
        catch(e) {
            offset = null
            continue
        }

        const collection = client.db("users").collection("users")
        if (Object.keys(patterns).includes(necessaryData.text)) {
            patterns[necessaryData.text].do(necessaryData.username, collection).then((message) => {
                sendMessage(necessaryData.chat_id, message)
            })
        }
        else {
            collection.find({_id: necessaryData.username}).toArray((err, results) => {
                let userDB = results[0]
                let findedKey = 'default'
                for (let message of Object.keys(patterns)) {
                    if (patterns[message].status == userDB.status) {
                        findedKey = message
                    }
                }
                patterns[findedKey].do(userDB._id, collection, necessaryData.text).then((message) => {
                    sendMessage(necessaryData.chat_id, message)
                })
            })
        }
        offset = necessaryData.update_id + 1
    }
}

main()
