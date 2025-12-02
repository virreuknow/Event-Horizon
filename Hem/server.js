const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files

const loginPath = path.join(__dirname, 'login.json');

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const data = JSON.parse(fs.readFileSync(loginPath, 'utf8'));
    const user = data.login.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Fel användarnamn eller lösenord.' });
    }
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    let data = JSON.parse(fs.readFileSync(loginPath, 'utf8'));
    data.login.push({ username, password, followedWords: [] });
    fs.writeFileSync(loginPath, JSON.stringify(data, null, 2));
    res.json({ success: true });
    
});

// Followed Words endpoint
app.post('/api/followedWords', (req, res) => {
    const { username, followedWords } = req.body;
    let data = JSON.parse(fs.readFileSync(loginPath, 'utf8'));
    const user = data.login.find(u => u.username === username);
    if (user) {
        user.followedWords = followedWords;
        fs.writeFileSync(loginPath, JSON.stringify(data, null, 2));
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'User not found.' });
    }
});



// --------- Databas ----------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "oppetHus-forum",
    charset: "utf8mb4"
});

// --------- Filtrering ----------
function cleanOrNull(str = "") {
    const badWords = ["badword1", "badword2", "badword3"]; // Lägg till fler otillåtna ord här
    const lower = str.toLowerCase();
    for (const w of badWords) {
        if (lower.includes(w)) return null;
    }
    return str.trim();
}

// --------- API ----------
app.post("/api/create", (req, res) => {
    const { username, topic, message } = req.body;

    const user = cleanOrNull(username);
    const top = cleanOrNull(topic);
    const msg = cleanOrNull(message);

    if (!user || !top || !msg) {
        return res.status(400).json({ error: "Ogiltigt innehåll eller otillåtet ord." });
    }

    db.query(
        "INSERT INTO forum (username, topics, messages, parent_id) VALUES (?, ?, ?, 0)",
        [user, top, msg],
        err => {
            if (err) return res.status(500).json({ error: err });
            res.json({ ok: true });
        }
    );
});

// Hämta alla topics
app.get("/api/topics", (req, res) => {
    db.query("SELECT * FROM forum WHERE parent_id = 0", (err, rows) => {
        res.json(rows);
    });
});

// Hämta topic + replies
app.get("/api/topic/:id", (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM forum WHERE id = ?", [id], (err, topicRows) => {
        if (err) return res.status(500).json({ error: err });
        if (!topicRows.length) return res.status(404).json({ error: "Topic finns inte." });

        db.query(
            "SELECT * FROM forum WHERE parent_id = ?",
            [id],
            (err2, replyRows) => {
                if (err2) return res.status(500).json({ error: err2 });
                res.json({ topic: topicRows[0], messages: replyRows });
            }
        );
    });
});

// Ta bort ett meddelande (tar även bort alla replies till ett topic)
app.delete("/api/message/:id", (req, res) => {
    const { id } = req.params;
    db.query(
        "DELETE FROM forum WHERE id = ? OR parent_id = ?",
        [id, id],
        err => {
            if (err) return res.status(500).json({ error: err });
            res.json({ ok: true });
        }
    );
});

// Skicka svar
app.post("/api/reply", (req, res) => {
    const { username, message, topicId } = req.body;

    const user = cleanOrNull(username);
    const msg = cleanOrNull(message);

    if (!user || !msg || !topicId) {
        return res.status(400).json({ error: "Ogiltigt innehåll eller topicId saknas." });
    }

    // Replies får bara pekar på root-topics (parent_id = 0)
    db.query(
        "SELECT id FROM forum WHERE id = ? AND parent_id = 0",
        [topicId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            if (!rows.length) {
                return res.status(400).json({ error: "Topic finns inte eller är inte en root." });
            }

            db.query(
                "INSERT INTO forum (username, topics, messages, parent_id) VALUES (?, '', ?, ?)",
                [user, msg, topicId],
                err2 => {
                    if (err2) return res.status(500).json({ error: err2 });
                    res.json({ ok: true });
                }
            );
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});