const express = require('express')
const app = express()
const fs = require('fs')
 const path = require('path')
const port = 3001
const fil = './db.json'

app.use(express.json()) // Läsa JSON

// index.html med mera, filer i hem mappen
app.use(express.static(path.join(__dirname)))


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

function läsdata() {
    const data = fs.readFileSync(fil, 'utf8')
    return JSON.parse(data)
}

function skrivdata(data) {
    fs.writeFileSync(fil, JSON.stringify(data, null, 2))
}

app.post('/register', (req, res) => {
    const { username, password } = req.body
    const db = läsdata()
    const existingUser = db.users.find(user => user.username === username)
    if (existingUser) {
        return res.send('User already exists')
    }

    const newUser = {
        id: db.users.length + 1,
        username,
        password
    }
    db.users.push(newUser)
    skrivdata(db)
    res.send('User registered successfully')
})

app.post('/login', (req, res) => {
    const { username, password } = req.body
    const db = läsdata()
    const user = db.users.find(x => x.username === username && x.password === password)
    if (user) {
        res.send('Login successful')
    } else {
        res.send('Invalid username or password')
    }
})



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})