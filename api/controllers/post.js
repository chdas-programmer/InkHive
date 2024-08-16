import { db } from "../db.js";
import jwt from "jsonwebtoken";

// Retrieves posts from a database
export const getPosts = async (req, res) => {
  try {
    // Define the SQL query based on the presence of a category parameter
    const q = req.query.cat
      ? "SELECT * FROM posts WHERE cat = ?"
      : "SELECT * FROM posts";
    
    // Execute the query with the provided parameter if it exists
    const [rows] = await db.query(q, [req.query.cat].filter(Boolean));

    // Send the results as JSON with a 200 status code
    return res.status(200).json(rows);
  } catch (err) {
    // If there's an error, send a 500 status code and the error message
    console.error(err);
    return res.status(500).json(err.message);
  }
};

// Retrieves a single post from the database
export const getPost = async (req, res) => {
  try {
    // Define the SQL query with a join to get post details and user information
    const q =
      "SELECT p.id, `username`, `title`, `descr`, p.img, u.img AS userImg, `cat`, `date` " +
      "FROM users u JOIN posts p ON u.id = p.uid WHERE p.id = ?";
    
    // Execute the query using the connection pool
    const [rows] = await db.query(q, [req.params.id]);

    // Check if the post exists
    if (rows.length === 0) {
      return res.status(404).json("Post not found");
    }

    // Send the result as JSON
    return res.status(200).json(rows[0]);
  } catch (err) {
    // If there's an error, send a 500 status code and the error message
    console.error(err);
    return res.status(500).json(err.message);
  }
};

// Adds a new post to the database
export const addPost = async (req, res) => {
  try {
    // Check if the user is authenticated by checking for a token in the cookies
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated!");

    // Verify the token using the secret key
    const userInfo = jwt.verify(token, "jwtkey");

    // Construct the SQL query to insert a new post into the database
    const q =
      "INSERT INTO posts(`title`, `descr`, `img`, `cat`, `date`, `uid`) VALUES (?)";

    // Define an array of values to be inserted into the database
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      req.body.date,
      userInfo.id,
    ];

    // Execute the SQL query with the values array using the connection pool
    await db.query(q, [values]);

    // Return a 200 status code and a success message
    return res.status(200).json("Post has been created.");
  } catch (err) {
    // If there's an error, return a 500 status code and the error message
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json(err.message);
  }
};

// Deletes a post from the database
export const deletePost = async (req, res) => {
  try {
    // Check if the user is authenticated by checking for a token in the cookies
    const token = req.cookies.access_token;
    if (!token) return res.status(401).json("Not authenticated");

    // Verify the token using the secret key
    const userInfo = jwt.verify(token, "jwtkey");

    // Get the ID of the post to be deleted from the request parameters
    const postId = req.params.id;

    // Construct an SQL query to delete the post with the specified ID, but only if
    // the user ID associated with the post matches the ID of the authenticated user
    const q = "DELETE FROM posts WHERE `id` = ? AND `uid` = ?";

    // Execute the SQL query with the postId and userInfo.id as parameters using the connection pool
    const [result] = await db.query(q, [postId, userInfo.id]);

    // Check if any rows were affected (i.e., a post was deleted)
    if (result.affectedRows === 0) {
      return res.status(403).json("You can delete only your post");
    }

    // Return a 200 status code and a success message
    return res.status(200).json("Post has been deleted");
  } catch (err) {
    // If there's an error, return a 500 status code and the error message
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json("Token is not valid");
    }
    return res.status(500).json(err.message);
  }
};

// Update a post
export const updatePost = async (req, res) => {
  try {
    // Get the access token from the request cookies
    const token = req.cookies.access_token;

    // Check if the token exists, if not, return an error response
    if (!token) return res.status(401).json("Not authenticated!");

    // Verify the token using the "jwtkey" secret key
    const userInfo = jwt.verify(token, "jwtkey");

    // Get the post ID from the request parameters
    const postId = req.params.id;

    // SQL query to update the post with new values
    const q =
      "UPDATE posts SET `title` = ?, `descr` = ?, `img` = ?, `cat` = ? WHERE `id` = ? AND `uid` = ?";

    // An array containing the new values for the post and the post ID
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.cat,
      postId,
      userInfo.id
    ];

    // Execute the SQL query with the values array using the connection pool
    const [result] = await db.query(q, values);

    // Check if any rows were affected (i.e., a post was updated)
    if (result.affectedRows === 0) {
      return res.status(403).json("You can update only your post");
    }

    // Return a 200 status code and a success message
    return res.status(200).json("Post has been updated.");
  } catch (err) {
    // If there's an error, return a 500 status code and the error message
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json("Token is not valid!");
    }
    return res.status(500).json(err.message);
  }
};