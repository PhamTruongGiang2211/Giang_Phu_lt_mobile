const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

const recipes = [
  {
    recipeId: 1,
    title: "Phở bò",
    photo_url: "https://example.com/pho.jpg",
    categoryId: 1,
  },
  {
    recipeId: 2,
    title: "Bánh mì",
    photo_url: "https://example.com/banhmi.jpg",
    categoryId: 2,
  }
];

app.get("/api/recipes", (req, res) => {
  res.json(recipes);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});