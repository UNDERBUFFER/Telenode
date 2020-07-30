
const patterns = {
    'default': {
        'status': 0,
        do() {
            return new Promise(resolve => {
                resolve('Извини, я не поянл твоего сообщения')
            })
        }
    },
    '/start': {
        'status': 1,
        do(username, collection) {
            return new Promise(resolve => {
                collection.insertOne({
                    _id: username,
                    status: 0,
                    notes: []
                }, (err, results) => {
                    resolve(`Привет, ${username}!\n
Я бот умеющий запоминать всё, что ты мне сказал, в виде заметок.\n
К сожалению, на данный момент своей жизни я понимаю только следующие команды:\n
'/note' - подтвердаю готовность считать твоё следующее сообщение и преобразовать его в заметку;\n
'/reset' - подтвердаю готовность удалить твою заметку с идентификатором, присланным тобой в следующем сообщении;\n
'/show' - без всяких вопросов вывожу все заметки, сделанные тобой.\n
Мой разработчик желает тебе успехов в работе со мной)))`)
                })
            })
        }
    },
    '/note': {
        'status': 2,
        do(username, collection, text=null) {
            return new Promise(resolve => {
                collection.find({_id: username}).toArray((err, results) => {
                    const userDB = results[0]
                    if (userDB.status != this.status) {
                        collection.updateOne({_id: username}, {$set: {status: this.status}}, (err, results) => {
                            resolve(`Ага, я запомню твое следующее сообщение!`)
                        })
                    }
                    else {
                        const notes = userDB.notes || []
                        notes.push(text)
                        collection.updateOne({_id: username}, {$set: { notes, status: 0 }}, (err, results) => {})
                        resolve(`Заметка сделана!`)
                    }
                })
            })
        }
    },
    '/reset': {
        'status': 3,
        do(username, collection, text=null) {
            return new Promise(resolve => {
                collection.find({_id: username}).toArray((err, results) => {
                    const userDB = results[0]
                    if (userDB.status != this.status) {
                        collection.updateOne({_id: username}, {$set: {status: this.status}}, (err, results) => {
                            resolve(`Ага, я удалю заметку с идентификатором, присланным тобой!`)
                        })
                    }
                    else {
                        const notes = userDB.notes || []
                        notes.splice(parseInt(text) - 1, 1)
                        collection.updateOne({_id: username}, {$set: { notes, status: 0 }}, (err, results) => {
                            resolve(`Заметка удалена! Идентификатор теперь съехали!`)
                        })
                    }
                })
            })
        }
    },
    '/show': {
        'status': 4,
        do(username, collection) {
            const notes = []
            return new Promise(resolve => {
                collection.find({_id: username}).toArray((err, results) => {
                    let userDB = results[0]
                    notes.push(...(userDB.notes || []))
                    for (let i = 0; i < notes.length; i++) notes[i] = `${String(i + 1)}: ${notes[i]}`
                    resolve(notes.join('\n'))
                })                
            })
        }
    }
}

module.exports = patterns
