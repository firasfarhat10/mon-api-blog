const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Article = require('../models/articleModel');
const handleError = require('../utils/handleError');
 
const MIN_PASSWORD = 6;
 
// Génère un JWT signé contenant l'id et le rôle (exercice 3 : durée réglable dans .env)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
};
 
// Réponse commune à l'inscription et à la connexion (sans le mot de passe)
const authResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  token: generateToken(user._id, user.role)
});
 
// POST /api/users/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe requis' });
    }
    // Vérifié AVANT le hachage : le hash fait toujours 60 caractères
    if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
      return res.status(400).json({ message: `Le mot de passe doit comporter au moins ${MIN_PASSWORD} caracteres` });
    }
 
    const userExists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (userExists) {
      return res.status(409).json({ message: 'Cet email est deja utilise' });
    }
 
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
 
    // Exercice 2 : le rôle n'est jamais lu depuis req.body (pas d'escalade de privilèges)
    const user = await User.create({ name, email, password: hashedPassword, age, role: 'user' });
 
    res.status(201).json(authResponse(user));
  } catch (err) {
    handleError(err, res);
  }
};
 
// POST /api/users/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }
 
    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    // Même message dans les deux cas : on ne révèle pas si l'email existe
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
 
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
 
    res.status(200).json(authResponse(user));
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/users/profile (protect)
const getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};
 
// PUT /api/users/update-password (protect) - Exercice 1
const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'oldPassword et newPassword sont requis' });
    }
    if (typeof newPassword !== 'string' || newPassword.length < MIN_PASSWORD) {
      return res.status(400).json({ message: `Le nouveau mot de passe doit comporter au moins ${MIN_PASSWORD} caracteres` });
    }
 
    // req.user n'a pas le mot de passe (select('-password')) : on recharge l'utilisateur complet
    const user = await User.findById(req.user._id);
 
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }
 
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
 
    res.status(200).json({ message: 'Mot de passe mis a jour avec succes' });
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/users (protect + adminOnly)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/users/:id (protect + adminOnly)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    res.status(200).json(user);
  } catch (err) {
    handleError(err, res);
  }
};
 
// PUT /api/users/:id/role (protect + adminOnly) - Exercice 2
const updateUserRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
 
    user.role = req.body.role || 'admin'; // l'enum du schéma refuse toute autre valeur
    await user.save({ validateModifiedOnly: true });
 
    res.status(200).json({ message: `Role mis a jour : ${user.role}`, user });
  } catch (err) {
    handleError(err, res);
  }
};
 
// DELETE /api/users/:id (protect + adminOnly) - repris de la séance 3
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    const article = await Article.findOne({ author: req.params.id });
    if (article) {
      return res.status(400).json({ message: 'Impossible de supprimer un utilisateur ayant des articles publies' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Utilisateur supprime avec succes', id: req.params.id });
  } catch (err) {
    handleError(err, res);
  }
};
 
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updatePassword,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
};
