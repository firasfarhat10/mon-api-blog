const express = require('express');   // 1. charger Express
 
const app = express();                 // 2. créer l'application
const PORT = 3000;
 
// 3. une route : GET /
app.get('/', (req, res) => {
  res.json({ message: "Bonjour, je suis l'API du blog" });
});
 
// 4. démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur disponible sur http://localhost:${PORT}`);
});
