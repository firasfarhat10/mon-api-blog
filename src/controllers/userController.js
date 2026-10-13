
const User = require('../models/userModel');
const Article = require('../models/articleModel');
const handleError = require('../utils/handleError');
 
// POST /api/users
const createUser = async (req, res) => {
  try {
    const { name, email, age, role, bio, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Le nom et l'email sont requis" });
    }
    // Vérification de doublon d'email
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'Cet email est deja utilise' });
    }
    const user = await User.create({ name, email, age, role, bio, phone });
    res.status(201).json(user);
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/users (filtre optionnel ?role=...)
const getAllUsers = async (req, res) => {
  try {
    const filtre = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filtre);
    res.status(200).json(users);
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    res.status(200).json(user);
  } catch (err) {
    handleError(err, res);
  }
};
 
// DELETE /api/users/:id (exercice 1 : suppression sécurisée)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouve' });
    }
    // Intégrité référentielle : l'utilisateur a-t-il des articles ?
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
 
module.exports = { createUser, getAllUsers, getUserById, deleteUser };
