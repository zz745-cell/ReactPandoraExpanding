const users = [
  {
    id: 'user-1',
    email: 'test@example.com',
    password: 'password',
    role: 'user',
  },
  {
    id: 'admin-1',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
  },
];

function findUserByEmail(email) {
  return users.find((user) => user.email === email) || null;
}

module.exports = {
  findUserByEmail,
};


