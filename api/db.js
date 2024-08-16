// import mysql from "mysql"

// const db = mysql.createConnection({
//   host:"localhost",
//   user:"root",
//   password:"Chanchal@1",
//   database:"blog"
// })

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err.stack);
//     return;
//   }
//   console.log('Connected to the MySQL database as ID ' + db.threadId);
// });

// // Export the connection for use in other files
// export { db};





import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Chanchal@1",
  database: "blog",
});

console.log("Database connected successfully");

export { db };


