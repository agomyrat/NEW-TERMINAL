const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController')
router.get('/:id', itemController.getById)
      .get('/search/:search_text/limit/:limit', itemController.search)
      .get('/barcode/:barcode', itemController.getByBarcode)
      .post('/sanaw/newItem', itemController.getItemForSanaw)
      .get('/sanaw/:terminal', itemController.getAllSanaw)
      .put('/sanaw/changeCount', itemController.changeCount)
      .delete('/sanaw/', itemController.deleteSanaw);
module.exports = router;
