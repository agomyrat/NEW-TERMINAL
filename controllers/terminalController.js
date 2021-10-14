const db = require('../config/database.js');
const catchAsync = require('../utils/catchAsync');
const {QueryTypes, Model, Sequelize} = require('sequelize');



exports.allTerminals = catchAsync(async(req, res, next)=>{
    const terminals = await db.query('SELECT TERMINAL_NAME, MBT_ID FROM MB_TERMINALS ORDER BY TERMINAL_NAME', {
        type: QueryTypes.SELECT
    });

    res.json(terminals);
});




