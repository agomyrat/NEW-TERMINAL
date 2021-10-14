const db = require('../config/database.js');
const catchAsync = require('../utils/catchAsync');
const {QueryTypes, Model, Sequelize} = require('sequelize');



exports.print = catchAsync(async (req, res, next) => {
    const { id, miktar, birim, printer_id, ribon, print_type, galyndy, kapak, tarih, size } = req.body
    const printInfo = await db.query(`INSERT INTO MB_PRINTER_QUEUE(ITEM_REF , MIKTAR, BIRIM, PRINTER_ID, PRINT_TYPE, SIZE, GALYNDY_BARCODE, KAPAK, RIBON, TARIH) 
    VALUES(:id, :miktar, :birim,  :printer_id, :print_type, :size, :galyndy, :kapak, :ribon, :tarih);`,
        {
            replacements: { id, miktar, birim, printer_id, ribon, print_type, galyndy, kapak, tarih, size },
            type: QueryTypes.INSERT
        })
    if (!!printInfo) {
        res.status(200).json({
            status: 'success',
            message : 'Item printed successfully!'
        });
    }
});


exports.getPrinters = catchAsync(async (req, res) => {
    const printers = await db.query('SELECT ID id, PRINTER_PATH path, TERMINAL_NAME name, DEPO_NR depo_nr FROM MB_PRINTERS printers', { type: QueryTypes.SELECT });
    res.send(printers)
});
