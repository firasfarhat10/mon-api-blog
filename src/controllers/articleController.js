const Article = require('../models/articleModel');
const handleError = require('../utils/handleError');
 
// Vrai si l'utilisateur connecté est l'auteur de l'article ou un admin
const peutModifier = (article, user) =>
  article.author.toString() === user._id.toString() || user.role === 'admin';
 
// GET /api/articles (public)
const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().populate('author', 'name email');
    res.status(200).json(articles);
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/articles/my-articles (protect) - Exercice 2
const getMyArticles = async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ total: articles.length, articles });
  } catch (err) {
    handleError(err, res);
  }
};
 
// GET /api/articles/:id (public)
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
 
// POST /api/articles (protect) : l'auteur vient du token, plus du body
const createArticle = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Titre et contenu obligatoires' });
    }
 
    const newArticle = await Article.create({ title, content, author: req.user._id });
    const populated = await newArticle.populate('author', 'name email role');
    res.status(201).json(populated);
  } catch (err) {
    handleError(err, res);
  }
};
 
// PUT /api/articles/:id (protect) : auteur ou admin
const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article non trouve' });
    }
    if (!peutModifier(article, req.user)) {
      return res.status(403).json({ message: "Action interdite : vous n'etes pas l'auteur de cet article" });
    }
 
    article.title = req.body.title || article.title;
    article.content = req.body.content || article.content;
    const updated = await article.save();
    const populated = await updated.populate('author', 'name email role');
 
    res.status(200).json(populated);
  } catch (err) {
    handleError(err, res);
  }
};
 
// DELETE /api/articles/:id (protect) : auteur ou admin
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article non trouve' });
    }
    if (!peutModifier(article, req.user)) {
      return res.status(403).json({ message: "Action interdite : vous n'etes pas l'auteur de cet article" });
    }
 
    await Article.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Article supprime avec succes', id: req.params.id });
  } catch (err) {
    handleError(err, res);
  }
};
 
module.exports = {
  getAllArticles,
  getMyArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle
};
