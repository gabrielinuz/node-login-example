##CONFIGURE INSTALL
npm init -y
npm install express mongoose bcryptjs jsonwebtoken cors

##MONGO SERVER UP, AS ROOT USER:
service mongod start

##SERVER UP
node start
