const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files

const loginPath = path.join(__dirname, 'db.json');

function readUserFile() {
    if (!fs.existsSync(loginPath)) {
        fs.writeFileSync(loginPath, JSON.stringify({ users: [] }, null, 2));
    }
    try {
        const parsed = JSON.parse(fs.readFileSync(loginPath, 'utf8'));
        parsed.users = parsed.users || parsed.login || [];
        return parsed;
    } catch (err) {
        return { users: [] };
    }
}

function writeUserFile(data) {
    fs.writeFileSync(loginPath, JSON.stringify({ users: data.users }, null, 2));
}

function requireCredentials(req) {
    const body = req.body || {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password.trim() : '';
    return { username, password };
}

function cleanOrNull(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
}

// Login endpoint
app.post('/api/login', (req, res) => {
    const { username, password } = requireCredentials(req);
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Input both Username and Password' });
    }

    try {
        const data = readUserFile();
        const user = data.users.find(u => u.username === username && u.password === password);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Wrong username or password' });
        }

        res.json({ success: true, user: { username: user.username, followedWords: user.followedWords || [] } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Internal server error trying to login' });
    }
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { username, password } = requireCredentials(req);

    if (!username || !password) {
        return res.json({ success: false, message: 'Input both Usernname and Password' });
    }

    try {
        const data = readUserFile();
        const exists = data.users.some(u => u.username.toLowerCase() === username.toLowerCase());

        if (exists) {
            return res.json({ success: false, message: 'Username is already in use' });
        } 
            const nextId = data.users.reduce((max, u) => Math.max(max, u.id || 0), 0) + 1;
        data.users.push({ id: nextId, username, password, followedWords: [] });
        writeUserFile(data);
        res.json({ success: true });
        }
     finally {
        // No-op
    }
});

// Followed Words endpoint
app.post('/api/followedWords', (req, res) => {
    const body = req.body || {};
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const followedWords = Array.isArray(body.followedWords) ? body.followedWords : [];

    if (!username) {
        return res.status(400).json({ success: false, message: 'Username is missing' });
    }

    try {
        const data = readUserFile();
        const user = data.users.find(u => u.username === username);
        if (user) {
            user.followedWords = followedWords;
            writeUserFile(data);
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'User not found.' });
        }
    } catch (err) {
        console.error('Followed words error:', err);
        res.status(500).json({ success: false, message: 'Internal server error while saving word' });
    }
});

//NYA DELAR FÖR FORUM

// --------- Databas ----------
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "oppetHus-forum",
    charset: "utf8mb4"
});

db.connect(err => {
    if (err) {
        console.error("Could not connect to MySQL:", err);
    } else {
        console.log("MySQL connected for forum.");
    }
});

// --------- API ----------
app.post("/api/create", (req, res) => {
    const { username, topic, message } = req.body;

    const user = cleanOrNull(username);
    const top = cleanOrNull(topic);
    const msg = cleanOrNull(message);

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
    db.query("SELECT * FROM forum WHERE parent_id = 0 ORDER BY id DESC", (err, rows) => {
        if (err) {
            console.error("Topics read error:", err);
            return res.status(500).json({ error: "Could not read topics" });
        }
        res.json(rows);
    });
});

// Hämta topic + replies
app.get("/api/topic/:id", (req, res) => {
    const id = req.params.id;

    db.query("SELECT * FROM forum WHERE id = ?", [id], (err, topicRows) => {
        if (err) {
            console.error("Topic read error:", err);
            return res.status(500).json({ error: "Could not read topic" });
        }
        if (!topicRows.length) return res.status(404).json({ error: "Topic not found." });

        db.query(
            "SELECT * FROM forum WHERE parent_id = ?",
            [id],
            (err2, replyRows) => {
                if (err2) {
                    console.error("Replies read error:", err2);
                    return res.status(500).json({ error: "Could not read replies" });
                }
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

    // Replies får bara peka på root-topics
    db.query(
        "SELECT id FROM forum WHERE id = ? AND parent_id = 0",
        [topicId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            if (!rows.length) {
                return res.status(400).json({ error: "Topic doesn't exist, check internet conncection" });
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
