const User = require('../models/user');

const adminMiddleware = async (req, res, next) => {
  const user = await User.findByPk(req.user.id);  // req.user is set by authMiddleware

  if (user && user.isAdmin) {
    next();
  } else {
    return res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = adminMiddleware;
