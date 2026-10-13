const Article = require('../models/articleModel');
const User = require('../models/userModel');
const handleError = require('../utils/handleError');
 
// GET /api/articles (avec l'auteur peuplé)
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name email');
    res.status(200).json(articles);
  } catch (err) {
    handleError(err, res);
  }
};
 
// POST /api/articles
const createArticle = async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    if (!title || !content || !authorId) {
      return res.status(400).json({ message: 'title, content et authorId sont obligatoires' });
    }
    // L'auteur doit exister dans la collection users
    const author = await User.findById(authorId);
    if (!author) {
      return res.status(404).json({ message: 'Auteur non trouve (identifiant authorId invalide)' });
    }
    const newArticle = await Article.create({ title, content, author: authorId });
    const populatedArticle = await newArticle.populate('author', 'name email');
    res.status(201).json(populatedArticle);
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/articles/:id
const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id).populate('author', 'name email');
    if (!article) {
      return res.status(404).json({ message: 'Article non trouve' });
    }
    res.status(200).json(article);
  } catch (err) {
    handleError(err, res);
  }
};
 
// PUT /api/articles/:id
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true } // = { new: true } (déprécié dans Mongoose 9)
    );
    if (!article) {
      return res.status(404).json({ message: 'Article introuvable pour la mise a jour' });
    }
    const populated = await article.populate('author', 'name email');
    res.status(200).json(populated);
  } catch (err) {
    handleError(err, res);
  }
};
 
// DELETE /api/articles/:id
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article introuvable pour la suppression' });
    }
    res.status(200).json({ message: 'Article supprime avec succes', id: req.params.id });
  } catch (err) {
    handleError(err, res);
  }
};
 
module.exports = { getAllArticles, createArticle, getArticleById, updateArticle, deleteArticle };
