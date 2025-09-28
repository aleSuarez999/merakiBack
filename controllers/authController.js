import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const users = [
  { id: 1, username: 'admin', password: bcrypt.hashSync('clave123', 10) }
];

export const login = (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
    // busqueda basica en array
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });
  }

  const token = jwt.sign({ 
            id: user.id, 
            username: user.username 
        }, 
        process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  // devuelvo el token
  res.json(
    { 
        ok: true, 
        token 
    });
};
