// Traduit les erreurs Mongoose en réponses HTTP propres (utilisé dans tous les catch)
const handleError = (err, res) => {
  // Exercice 2 : identifiant mal formé (ex : /api/articles/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Identifiant de ressource invalide (format ObjectId attendu)' });
  }
  // Données refusées par le schéma (match, min, enum, required, maxlength...)
  if (err.name === 'ValidationError') {
    const erreurs = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Donnees invalides', erreurs });
  }
  // Doublon sur un index unique (email)
  if (err.code === 11000) {
    return res.status(409).json({ message: 'Cet email est deja utilise' });
  }
  return res.status(500).json({ message: err.message });
};
 
module.exports = handleError;
