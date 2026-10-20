const invalid = (res, message) =>
  res.status(400).json({ status: 400, message });

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return invalid(res, "Name, email, and password are required");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return invalid(res, "Enter a valid email address");
  }
  if (typeof password !== "string" || password.length < 8) {
    return invalid(res, "Password must be at least 8 characters");
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return invalid(res, "Email and password are required");
  }

  next();
};

const validateTask = (req, res, next) => {
  if (typeof req.body.title !== "string" || !req.body.title.trim()) {
    return invalid(res, "Task title is required");
  }

  req.body.title = req.body.title.trim();
  next();
};

module.exports = { validateRegister, validateLogin, validateTask };