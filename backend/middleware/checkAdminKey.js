function checkAdminKey(req, res, next) {
  // The admin key is sent only in request headers and compared on the server.
  // This keeps the secret out of frontend code and prevents client-side exposure.
  const adminKey = req.header('x-admin-key');

  // Deny when key is missing or invalid.
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  return next();
}

module.exports = checkAdminKey;
