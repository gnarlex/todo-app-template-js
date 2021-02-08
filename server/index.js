'use strict';

const path       = require('path');
const express    = require('express');
const helmet     = require('helmet');
const bodyParser = require('body-parser');
const config     = require('server/config');
const db         = require('server/db');
const queries    = require('server/queries');

const app = module.exports = express();

// It's best to use Helmet early in your middleware stack so that its headers are sure to be set.
app.use(helmet());

// Body parsing middleware.
app.use(bodyParser.json());

// Pretty JSON output.
app.set('json spaces', 4);

// Serve static client files.
app.use('/', express.static(path.join(__dirname, '../client')));

app.post('/tasks', async (req, res) => {
    const args = req.body;

    return db.sendQuery({sql: queries.createTask, args})
        .then(() => res.sendStatus(201));
});

app.get('/tasks', async (req, res) => {
    const rows = await db.sendQuery({sql: queries.listTasks});

    return res
        .status(200)
        .json(rows);
});

app.delete('/tasks/:id', async (req, res) => {
    const {id} = req.params;

    return db.sendQuery({sql: queries.deleteTask, args: {id}})
        .then(() => res.sendStatus(200));
});

(async () => {

    // Create database tables.
    await db.sendQuery({sql: queries.createTasksTable});

    // Start the server.
    app.listen(config.API_PORT, () => {
        console.info(`Todo app started at: ${config.API_PORT}`);
    });

})().catch(error => console.error(error.stack));