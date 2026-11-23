const crypto = require('crypto');
const SECRET = process.env.SESSION_SECRET;
if (!SECRET || SECRET.length < 32) {
  throw new Error('Configure SESSION_SECRET com pelo menos 32 caracteres no backend/.env');
}
function sign(payload) {
  const body = Buffer.from(JSON.stringify({id: payload.id, exp: Date.now() + 8 * 60 * 60 * 1000})).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}
function verify(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const expected = crypto.createHmac('sha256', SECRET).update(parts[0]).digest();
  let received;
  try { received = Buffer.from(parts[1], 'base64url'); } catch { return null; }
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) return null;
  try { const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
    return Number.isInteger(data.id) && data.id > 0 && data.exp > Date.now() ? data : null;
  } catch { return null; }
}
function requireAuth(req,res,next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const session = verify(token);
  if (!session) return res.status(401).json({mensagem:'Entre na sua conta para continuar.'});
  req.citizenId = session.id;
  next();
}
module.exports = {sign,requireAuth};
