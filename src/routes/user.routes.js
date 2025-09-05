const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', authorizeRoles('Admin'), userController.create);
router.get('/', authorizeRoles('Admin'), userController.getAll);
router.get('/:id', authorizeRoles('Admin'), userController.getById);
router.put('/:id', authorizeRoles('Admin'), userController.update);
router.delete('/:id', authorizeRoles('Admin'), userController.softDelete);
router.patch('/restore/:id', authorizeRoles('Admin'), userController.restore);
router.delete('/force/:id', authorizeRoles('Admin'), userController.permanentDelete);


module.exports = router;