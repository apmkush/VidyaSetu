import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
const JWT_KEY = "HaHa";

export const generateToken = (userId) => {
  return sign({ user: { id: userId } }, JWT_KEY);
};

export const verifyToken = (token) => {
  return verify(token, JWT_KEY);
};

//function to generate a temporary token valid for only 30 minutes
export const generateTempToken = (userId) => {
  return sign({ user: { id: userId } }, JWT_KEY, { expiresIn: "30m" });
};

// export default { generateToken, verifyToken, generateTempToken };