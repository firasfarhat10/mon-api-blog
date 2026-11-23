// Promeut un utilisateur existant au rôle admin (premier administrateur).
// Usage : npm run make-admin -- aya@polytechnique.tn
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const User = require('../src/models/userModel');
 
(async () => {
  const email = (process.argv[2] || '').toLowerCase().trim();
  if (!email) {
    console.error('Usage : npm run make-admin -- <email>');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { returnDocument: 'after' });
    console.log(user ? `${user.email} est maintenant admin` : `Aucun utilisateur avec l'email ${email}`);
  } catch (err) {
    console.error('Erreur :', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
