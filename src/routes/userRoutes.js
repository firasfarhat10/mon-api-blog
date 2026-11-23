const express = require('express');
const router = express.Router();
const {
  registerUser, loginUser, getUserProfile, updatePassword,
  getAllUsers, getUserById, updateUserRole, deleteUser
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
 
// Routes publiques
router.post('/register', registerUser);
router.post('/login', loginUser);
 
// Routes privées (JWT valide). Les chemins fixes AVANT '/:id' !
router.get('/profile', protect, getUserProfile);
router.put('/update-password', protect, updatePassword);
 
// Routes administrateur (JWT valide + rôle admin)
router.get('/', protect, adminOnly, getAllUsers);
router.put('/:id/role', protect, adminOnly, updateUserRole);
router.get('/:id', protect, adminOnly, getUserById);
router.delete('/:id', protect, adminOnly, deleteUser);
 
module.exports = router;
