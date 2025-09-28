
export const apiKeyAuth = (req, res, next) => {
  const clientKey = req.headers['x-api-key'];
  const serverKey = process.env.API_KEY_BACKEND;

  if (!clientKey || clientKey !== serverKey) {
    return res.status(401).json({ ok: false, msg: 'Unauthorized: Invalid API Key' });
  }

  next();
};
