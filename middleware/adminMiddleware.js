// Admin authorization middleware
// Must be used after requireAuth
function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
  }
  next();
}

module.exports = { requireAdmin };