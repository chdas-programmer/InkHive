import { db } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    // Check if user already exists
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [req.body.email, req.body.username]
    );

    if (rows.length) {
      return res.status(409).json("User already exists!");
    }

    // Hash the password and create a user
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const [result] = await db.query(
      "INSERT INTO users (username, email, password) VALUES (?)",
      [[req.body.username, req.body.email, hash]]
    );

    return res.status(200).json("User has been created");

  } catch (err) {
    console.error(err);
    return res.status(500).json(err.message);
  }
};

export const login = async (req, res) => {
  try {
    // Query to find the user by username
    const [rows] = await db.query(
      "SELECT * FROM users WHERE username = ?",
      [req.body.username]
    );

    if (rows.length === 0) {
      return res.status(404).json("User not found!!!🧐");
    }

    // Check if the provided password is correct
    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      rows[0].password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json("Wrong username or password!!😣 Nome de usuário ou senha incorretos");
    }

    // Generate a JWT token
    const token = jwt.sign({ id: rows[0].id }, "jwtkey", { expiresIn: '1h' }); // Add expiration as needed

    // Exclude password from the response
    const { password, ...other } = rows[0];

    // Send the response with a cookie
    res.cookie("access_token", token, {
      httpOnly: true,
    }).status(200).json(other);

  } catch (err) {
    console.error(err);
    return res.status(500).json(err.message);
  }
};


export const logout = (req, res) => {
  res
    .clearCookie("access_token", {
      httpOnly: true,
      sameSite: "None", // Use 'None' for cross-site cookies if needed
      secure: true,    // Ensure the cookie is sent over HTTPS
    })
    .status(200)
    .json("User has been logged out🤩.");
};
