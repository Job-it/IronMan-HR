var authMiddleWare = (req, res, next) => {
  if (req.user) {
    res.append('user', JSON.stringify(req.user));
  }
  next();
}

module.exports = authMiddleWare;