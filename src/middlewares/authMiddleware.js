const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
 
// 1. Routes privées : vérifie le JWT et injecte l'utilisateur dans req.user
const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
 
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Non autorise, aucun token fourni' });
  }
 
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'Non autorise, utilisateur introuvable' });
    }
    return next();
  } catch (err) {
    // Exercice 3 : jeton expiré
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Votre session a expire, veuillez vous reconnecter' });
    }
    // Signature invalide, jeton mal formé...
    return res.status(401).json({ message: 'Non autorise, token invalide ou expire' });
  }
};
 
// 2. RBAC : réservé aux administrateurs (à placer après protect)
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Acces refuse : droits administrateur requis' });
};
 
module.exports = { protect, adminOnly };


