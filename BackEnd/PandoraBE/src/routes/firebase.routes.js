const express = require('express');
const { requireRole } = require('../middleware/requireRole');
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/firebaseUser.controller');

const router = express.Router();

//router.use(requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.put('/:uid', updateUser);
router.delete('/:uid', deleteUser);

module.exports = router;

