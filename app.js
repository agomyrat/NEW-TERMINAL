const express = require('express');
const db = require('./config/database');
const cors = require('cors');
const itemRoutes = require('./routes/itemRoutes');
const terminalRoutes = require('./routes/terminalRoutes');
const printRoutes = require('./routes/printRoutes')
const app = express();

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '20kb'}));
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(__dirname + '/public'));

// GLOBAL MIDDLEWARES
app.use(cors());

(async()=>{
    try {
        await db.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
})();

app.use('/api/v1/items', express.json({ limit: '10kb'}), itemRoutes);
app.use('/api/v1/terminals', express.json({ limit: '10kb'}), terminalRoutes);
app.use('/api/v1/print', express.json({ limit: '10kb'}), printRoutes);

module.exports = app;