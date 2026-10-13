const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const articleRoutes = require('./routes/articleRoutes');
const userRoutes = require('./routes/userRoutes');
 
// Chargement des variables d'environnement (.env)
dotenv.config();
 
const app = express();
const PORT = process.env.PORT || 3000;
 
app.use(express.json());
 
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
 
app.get('/', (req, res) => {
  res.json({ message: 'API du Blog - MongoDB Atlas + Mongoose' });
});
 
// Connexion à MongoDB Atlas puis démarrage de l'écoute
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`Serveur MERN en ecoute sur http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Erreur critique de demarrage du serveur :', err.message);
    process.exit(1);
  }
})();
