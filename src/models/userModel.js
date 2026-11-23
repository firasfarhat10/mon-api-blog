const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true
    },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format d'email invalide"]
    },
    // Contient le HASH bcrypt (60 caractères), jamais le mot de passe en clair.
    // La longueur minimale du mot de passe saisi est vérifiée dans le contrôleur, avant le hachage.
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire']
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: "{VALUE} n'est pas un role autorise"
      },
      default: 'user'
    },
    age: {
      type: Number,
      min: [4, "L'age minimum autorise est de 4 ans"]
    },
    // Champs de l'exercice 1 de la séance 3
    bio: {
      type: String,
      trim: true,
      maxlength: [200, 'La biographie ne peut pas depasser 200 caracteres']
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\d{8}$/, 'Numero de 8 chiffres requis']
    }
  },
  { timestamps: true }
);
 
module.exports = mongoose.model('User', userSchema);
