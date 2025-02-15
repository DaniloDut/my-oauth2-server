// Test in Postman
import express from "express";
import oauthRoutes from "./routes/oauthRoutes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/oauth', oauthRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`OAuth server running at http://localhost:${PORT}`);
});
