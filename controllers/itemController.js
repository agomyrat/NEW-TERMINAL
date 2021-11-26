const db = require('../config/database.js');
const catchAsync = require('../utils/catchAsync');
const { QueryTypes, Model, Sequelize } = require('sequelize');

exports.getById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (id) {
        const info = await db.query(
            `
                SELECT TOP 1 ITEMS.LOGICALREF id,
                    ITEMS.CODE code,
                    ITEMS.NAME name,
                    CONCAT(PRICE.PRICE, ' ',CURREN.CURCODE) price,
                    UNITSETF.CODE unit,
                    ISNULL(FORMAT(PRICE.BEGDATE,'yyyy.MM.dd'),'') last_updated_price,
                    0 current_stock
                FROM LG_${process.env.FIRM_NR}_ITEMS ITEMS
                LEFT JOIN LG_${process.env.FIRM_NR}_PRCLIST PRICE ON PRICE.CARDREF = ITEMS.LOGICALREF AND PRICE.LOGICALREF = (SELECT MAX(P2.LOGICALREF) 
                        FROM LG_${process.env.FIRM_NR}_PRCLIST P2	
                        LEFT JOIN LG_${process.env.FIRM_NR}_PRCLSTDIV PD2 ON PD2.PARENTPRCREF = P2.LOGICALREF WHERE P2.CARDREF = ITEMS.LOGICALREF 
                        AND P2.PTYPE = 2 AND CLSPECODE = '' AND BEGDATE <= GETDATE() AND ENDDATE > GETDATE() 
                        AND (PD2.DIVCODES = '-1' OR PD2.DIVCODES LIKE '%0${process.env.ISH_YERI}%')) AND PRICE.BEGDATE <= GETDATE() AND PRICE.ENDDATE > GETDATE() AND 
                        PRICE.PTYPE = 2 AND PRICE.CLSPECODE = ''
                LEFT JOIN L_CURRENCYLIST AS CURREN ON PRICE.CURRENCY = CURREN.CURTYPE AND CURREN.FIRMNR = ${process.env.FIRM_NR}
                LEFT JOIN LG_${process.env.FIRM_NR}_UNITSETF AS UNITSETF ON ITEMS.UNITSETREF = UNITSETF.LOGICALREF 
                LEFT JOIN LG_${process.env.FIRM_NR}_PRCLSTDIV PRCLSTDIV ON PRCLSTDIV.PARENTPRCREF = PRICE.LOGICALREF
                AND
                (PRCLSTDIV.DIVCODES = '-1' OR PRCLSTDIV.DIVCODES LIKE '%0${process.env.ISH_YERI}%')
                WHERE 
                ITEMS.LOGICALREF = :id AND
                ITEMS.ACTIVE = 0 
                GROUP BY ITEMS.LOGICALREF, ITEMS.CODE, ITEMS.NAME, CONCAT(PRICE.PRICE, ' ',CURREN.CURCODE), UNITSETF.CODE, PRICE.BEGDATE`,
            {
                replacements: { id },
                type: QueryTypes.SELECT,
            }
        );

        // get stocks
        info[0] = info[0]
            ? info[0]
            : {
                  id: null,
                  code: '',
                  name: '',
                  price: '',
                  unit: '',
                  last_updated_price: '',
                  current_stock: 0,
              };

        info[0].stock = await db.query(
            `
            SELECT DEPO_NR warehouse_nr, WHOUSE.NAME warehouse_name, ISNULL(ONHAND, 0 ) amount
            FROM MB_DEPO 
            LEFT JOIN L_CAPIWHOUSE AS WHOUSE ON WHOUSE.NR = DEPO_NR AND FIRMNR=${process.env.FIRM_NR}
            LEFT JOIN ${process.env.STOCK_VIEW} AS GNTOTST ON GNTOTST.STOCKREF = :id AND GNTOTST.INVENNO = DEPO_NR
            ORDER BY  MB_DEPO.ID`,
            {
                replacements: { id },
                type: QueryTypes.SELECT,
            }
        );

        res.json(info[0]);
    } else {
        res.status(400).json({ status: 'failed', message: 'Wrong ID' });
    }
});

exports.search = catchAsync(async (req, res, next) => {
    const { search_text, limit } = req.params;
    if (!search_text || !limit) {
        res.status(400).json({
            status: 'failed',
            message: 'Search text and limit are required.',
        });
    }
    const text = await db.query(
        `SELECT TOP :limit 
                                 LOGICALREF id, CODE code,[NAME] name FROM LG_${process.env.FIRM_NR}_ITEMS
                                 WHERE (CODE LIKE :search_text OR [NAME] LIKE :search_text OR NAME2 LIKE :search_text OR NAME3 
                                 LIKE :search_text OR NAME4 LIKE :search_text) AND CARDTYPE=1 AND ACTIVE=0 `,
        {
            replacements: { search_text: `%${search_text}%`, limit: +limit },
            type: QueryTypes.SELECT,
        }
    );
    res.json(text);
});

exports.getByBarcode = catchAsync(async (req, res, next) => {
    const barcode = req.params.barcode;
    if (!barcode) {
        res.status(400).json({
            status: 'failed',
            message: 'Barcode is missing or worng',
        });
    }
    //old version all in
    // const sqlQuery = `
    // SELECT TOP 1 ITEMS.LOGICALREF id, ITEMS.CODE code, ITEMS.NAME name, CONCAT(PRICE.PRICE, ' ',CURREN.CURCODE) price, UNITSETF.CODE unit, FORMAT(PRICE.BEGDATE,'yyyy.MM.dd') last_updated_price
    // FROM LG_${process.env.FIRM_NR}_ITEMS ITEMS
    // INNER JOIN LG_${process.env.FIRM_NR}_PRCLIST PRICE ON PRICE.CARDREF = ITEMS.LOGICALREF AND PRICE.LOGICALREF = (SELECT MAX(P2.LOGICALREF)
    //         FROM LG_${process.env.FIRM_NR}_PRCLIST P2
    //         LEFT JOIN LG_${process.env.FIRM_NR}_PRCLSTDIV PD2 ON PD2.PARENTPRCREF = P2.LOGICALREF WHERE P2.CARDREF = ITEMS.LOGICALREF
    //         AND P2.PTYPE = 2 AND CLSPECODE = '' AND BEGDATE <= GETDATE() AND ENDDATE > GETDATE()
    //         AND (PD2.DIVCODES = '-1' OR PD2.DIVCODES LIKE '%0${process.env.ISH_YERI}%'))
    // INNER JOIN L_CURRENCYLIST AS CURREN ON PRICE.CURRENCY = CURREN.CURTYPE AND CURREN.FIRMNR = ${process.env.FIRM_NR}
    // INNER JOIN LG_${process.env.FIRM_NR}_UNITSETF AS UNITSETF ON ITEMS.UNITSETREF = UNITSETF.LOGICALREF
    // INNER JOIN LG_${process.env.FIRM_NR}_PRCLSTDIV PRCLSTDIV ON PRCLSTDIV.PARENTPRCREF = PRICE.LOGICALREF
    // INNER JOIN LG_${process.env.FIRM_NR}_UNITBARCODE B1 ON B1.ITEMREF = ITEMS.LOGICALREF
    // INNER JOIN MB_BARCODE_SYS BSYS ON B1.BARCODE LIKE  CONCAT(BSYS.START_CODE,'%') AND LEN(B1.BARCODE) = (LEN(BSYS.START_CODE) + ITEM_LENGTH)
    // WHERE (LEFT('${barcode}', LEN(ISNULL(BSYS.START_CODE,0)) + ISNULL(BSYS.ITEM_LENGTH,0)) = B1.BARCODE OR B1.BARCODE = '${barcode}') AND
    // ITEMS.ACTIVE = 0 AND PRICE.BEGDATE <= GETDATE() AND PRICE.ENDDATE > GETDATE() AND
    // PRICE.PTYPE = 2 AND PRICE.CLSPECODE = '' AND
    // (PRCLSTDIV.DIVCODES = '-1' OR PRCLSTDIV.DIVCODES LIKE '%0${process.env.ISH_YERI}%')
    // GROUP BY ITEMS.LOGICALREF, ITEMS.CODE, ITEMS.NAME, CONCAT(PRICE.PRICE, ' ',CURREN.CURCODE), UNITSETF.CODE, PRICE.BEGDATE`;

    const sqlQuery = `
    SELECT TOP 1  B1.ITEMREF id
    FROM LG_${process.env.FIRM_NR}_UNITBARCODE B1 
    LEFT JOIN MB_BARCODE_SYS BSYS ON B1.BARCODE LIKE  CONCAT(BSYS.START_CODE,'%') AND LEN(B1.BARCODE) = (LEN(BSYS.START_CODE) + ITEM_LENGTH)
    WHERE (LEFT('${barcode}', LEN(ISNULL(BSYS.START_CODE,0)) + ISNULL(BSYS.ITEM_LENGTH,0)) = B1.BARCODE OR B1.BARCODE = '${barcode}')`;
    const item_id = await db.query(sqlQuery, {
        type: QueryTypes.SELECT,
    });
    console.log(item_id[0]);
    const id = item_id[0] ? item_id[0].id : null;
    if (id) {
        const info = await db.query(
            `
                SELECT TOP 1 ITEMS.LOGICALREF id,
                    ITEMS.CODE code,
                    ITEMS.NAME name,
                    CONCAT(PRICE.PRICE, ' ',CURREN.CURCODE) price,
                    UNITSETF.CODE unit,
                    ISNULL(FORMAT(PRICE.BEGDATE,'yyyy.MM.dd'),'') last_updated_price,
                    0 current_stock
                FROM LG_${process.env.FIRM_NR}_ITEMS ITEMS
                LEFT JOIN LG_${process.env.FIRM_NR}_PRCLIST PRICE ON PRICE.CARDREF = ITEMS.LOGICALREF AND PRICE.LOGICALREF = (SELECT MAX(P2.LOGICALREF) 
                        FROM LG_${process.env.FIRM_NR}_PRCLIST P2	
                        LEFT JOIN LG_${process.env.FIRM_NR}_PRCLSTDIV PD2 ON PD2.PARENTPRCREF = P2.LOGICALREF WHERE P2.CARDREF = ITEMS.LOGICALREF 
                        AND P2.PTYPE = 2 AND CLSPECODE = '' AND BEGDATE <= GETDATE() AND ENDDATE > GETDATE() 
                        AND (PD2.DIVCODES = '-1' OR PD2.DIVCODES LIKE '%0${process.env.ISH_YERI}%')) AND PRICE.BEGDATE <= GETDATE() AND PRICE.ENDDATE > GETDATE() AND 
                        PRICE.PTYPE = 2 AND PRICE.CLSPECODE = ''
                LEFT JOIN L_CURRENCYLIST AS CURREN ON PRICE.CURRENCY = CURREN.CURTYPE AND CURREN.FIRMNR = ${process.env.FIRM_NR}
                LEFT JOIN LG_${process.env.FIRM_NR}_UNITSETF AS UNITSETF ON ITEMS.UNITSETREF = UNITSETF.LOGICALREF 
                LEFT JOIN LG_${process.env.FIRM_NR}_PRCLSTDIV PRCLSTDIV ON PRCLSTDIV.PARENTPRCREF = PRICE.LOGICALREF
                AND
                (PRCLSTDIV.DIVCODES = '-1' OR PRCLSTDIV.DIVCODES LIKE '%0${process.env.ISH_YERI}%')
                WHERE 
                ITEMS.LOGICALREF = :id AND
                ITEMS.ACTIVE = 0 
                GROUP BY ITEMS.LOGICALREF, ITEMS.CODE, ITEMS.NAME, CONCAT(PRICE.PRICE, ' ',CURREN.CURCODE), UNITSETF.CODE, PRICE.BEGDATE`,
            {
                replacements: { id },
                type: QueryTypes.SELECT,
            }
        );

        // get stocks
        info[0] = info[0]
            ? info[0]
            : {
                  id: null,
                  code: '',
                  name: '',
                  price: '',
                  unit: '',
                  last_updated_price: '',
                  current_stock: 0,
              };

        info[0].stock = await db.query(
            `
            SELECT DEPO_NR warehouse_nr, WHOUSE.NAME warehouse_name, ISNULL(ONHAND, 0 ) amount
            FROM MB_DEPO 
            LEFT JOIN L_CAPIWHOUSE AS WHOUSE ON WHOUSE.NR = DEPO_NR AND FIRMNR=${process.env.FIRM_NR}
            LEFT JOIN ${process.env.STOCK_VIEW} AS GNTOTST ON GNTOTST.STOCKREF = :id AND GNTOTST.INVENNO = DEPO_NR
            ORDER BY  MB_DEPO.ID`,
            {
                replacements: { id },
                type: QueryTypes.SELECT,
            }
        );

        res.json(info[0]);
    } else {
        res.status(400).json({ status: 'failed', message: 'Wrong ID' });
    }
});

exports.getItemForSanaw = catchAsync(async (req, res, next) => {
    const { barcode, terminal } = req.body;
    if (!barcode || !terminal) {
        res.status(400).json({
            status: 'failed',
            message: 'Barcode or terminal is missing or worng',
        });
    }

    const info = await db.query(
        `
    SELECT TOP 1 ITEMS.LOGICALREF id, ITEMS.CODE code, ITEMS.NAME name,
    (CASE WHEN LEN('${barcode}') <> LEN(BR.BARCODE) THEN CONVERT(FLOAT, SUBSTRING('${barcode}', LEN(BS.START_CODE)+ BS.ITEM_LENGTH+1, BS.UNIT_LENGTH)) / BS.DEVIDE ELSE 1 END)
    miktar 
    FROM LG_${process.env.FIRM_NR}_UNITBARCODE BR
    LEFT JOIN MB_BARCODE_SYS BS ON LEFT(BR.BARCODE, LEN(BS.START_CODE)) = CONVERT(VARCHAR, BS.START_CODE) AND(LEN(BS.START_CODE) + BS.ITEM_LENGTH) = LEN(BR.BARCODE)
    LEFT JOIN LG_${process.env.FIRM_NR}_ITEMS ITEMS ON ITEMS.LOGICALREF = BR.ITEMREF
    WHERE LEFT('${barcode}', LEN(BS.START_CODE) + BS.ITEM_LENGTH) = BR.BARCODE OR '${barcode}' = BR.BARCODE 
    `,
        {
            replacements: { barcode: barcode },
            type: QueryTypes.SELECT,
        }
    );

    if (info[0].id > 0) {
        let dddd = await db.query(
            `
            IF NOT EXISTS (SELECT * FROM MB_SANOV WHERE ITEM_REF = :id and  PC_INFO = :terminal)
            INSERT INTO MB_SANOV(MIKTAR,ITEM_REF,PC_INFO) VALUES (:miktar,:id,:terminal)
        `,
            {
                replacements: {
                    miktar: info[0].miktar,
                    id: info[0].id,
                    terminal,
                },
                type: QueryTypes.INSERT,
            }
        );
    }

    res.json(info[0]);
});

exports.getAllSanaw = catchAsync(async (req, res, next) => {
    const { terminal } = req.params;
    if (!terminal) {
        res.status(400).json({
            status: 'failed',
            message: 'Terminal is missing or worng',
        });
    }

    await db.query(
        `
    DELETE FROM MB_SANOV WHERE PC_INFO = :terminal AND MIKTAR <= 0`,
        {
            replacements: { terminal },
            type: QueryTypes.SELECT,
        }
    );

    const info = await db.query(
        `
    SELECT ITEM_REF id, ITEMS.CODE code, ITEMS.NAME name, SUM(MIKTAR) miktar
    FROM MB_SANOV SANOV
    LEFT JOIN LG_${process.env.FIRM_NR}_ITEMS ITEMS ON ITEMS.LOGICALREF = SANOV.ITEM_REF
    WHERE PC_INFO = :terminal
    GROUP BY ITEM_REF, ITEMS.CODE, ITEMS.NAME
    HAVING SUM(MIKTAR) > 0
    ORDER BY ITEMS.CODE
    `,
        {
            replacements: { terminal },
            type: QueryTypes.SELECT,
        }
    );
    res.json(info);
});

exports.changeCount = catchAsync(async (req, res, next) => {
    const { id, miktar, terminal } = req.body;
    if (!terminal || !id) {
        res.status(400).json({
            status: 'failed',
            message: 'Some parametrs are missing or worng',
        });
    }

    const info = await db.query(
        `
        UPDATE MB_SANOV SET MIKTAR = :miktar  WHERE ITEM_REF = :id AND PC_INFO = :terminal;
    `,
        {
            replacements: { id, miktar, terminal },
            type: QueryTypes.UPDATE,
        }
    );

    // EGERDE BARCODE OKALAN VAGTY GOSHULMADYK BOLSA
    if (!info[1]) {
        await db.query(
            `
                IF NOT EXISTS (SELECT * FROM MB_SANOV WHERE ITEM_REF = :id and  PC_INFO = :terminal)
                INSERT INTO MB_SANOV(MIKTAR,ITEM_REF,PC_INFO) VALUES (:miktar,:id,:terminal)
            `,
            {
                replacements: { id, miktar, terminal },
                type: QueryTypes.INSERT,
            }
        );
    }
    res.status(200).json({
        status: 'success',
        message: 'Item count is updated',
    });
});

exports.deleteSanaw = catchAsync(async (req, res, next) => {
    const { id, terminal } = req.body;
    if (!terminal || !id) {
        res.status(400).json({
            status: 'failed',
            message: 'Some parametrs are missing or worng',
        });
    }
    const info = await db.query(
        `
        DELETE FROM MB_SANOV WHERE ITEM_REF = :id AND PC_INFO = :terminal;
    `,
        {
            replacements: { id, terminal },
            type: QueryTypes.UPDATE,
        }
    );
    res.status(200).json({
        status: 'success',
        message: 'Item count is updated',
    });
});
