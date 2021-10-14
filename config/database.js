const Sequelize = require('sequelize');

const db = new Sequelize('SYNC', 'sa', '123456789', {
    host: '172.16.27.2',
    dialect: 'mssql',
    dialectOptions: {
        // Observe the need for this nested `options` field for MSSQL
        options: {
            // Your tedious options here
            useUTC: false,
            dateFirst: 1,
        },
    },
    operatorsAliases: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        freezeTableName: true,
        underscored: false,
        timestamps: false,
    },
});

module.exports = db;
