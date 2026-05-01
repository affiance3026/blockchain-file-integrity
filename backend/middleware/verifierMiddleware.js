const verifierMiddleware = (req, res, next) => {
  try {
    // req.user comes from authMiddleware
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized access"
      });
    }

    if (req.user.role !== "verifier") {
      return res.status(403).json({
        message: "Access denied. Verifier only"
      });
    }

    next();

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Authorization failed"
    });
  }
};

module.exports = verifierMiddleware;