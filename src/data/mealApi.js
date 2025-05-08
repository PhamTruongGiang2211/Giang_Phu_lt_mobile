  import axios from 'axios';

  const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

  // 📦 Tách nguyên liệu từ dữ liệu món ăn
  export function extractIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
      const name = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];

      if (name && name.trim() !== "") {
        ingredients.push({
          name: name.trim(),
          measure: measure ? measure.trim() : "",
          image: `https://www.themealdb.com/images/ingredients/${name.trim()}.png`,
        });
      }
    }

    return ingredients;
  }

  // ✅ Lấy món ăn theo khu vực
  export async function getMealsByArea(areaName) {
    try {
      const response = await axios.get(`${BASE_URL}/filter.php?a=${areaName}`);
      return response.data.meals;
    } catch (error) {
      console.error('Lỗi lấy món theo khu vực:', error);
      return [];
    }
  }

  // ✅ Lấy chi tiết món ăn
  export async function getMealDetailsById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/lookup.php?i=${id}`);
      return response.data.meals;
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết món ăn:", error);
      return [];
    }
  } 

  // 🔍 Tìm món ăn theo tên
export async function searchMealsByName(name) {
  try {
    const response = await axios.get(`${BASE_URL}/search.php?s=${name}`);
    return response.data.meals;
  } catch (error) {
    console.error('Lỗi tìm món ăn theo tên:', error);
    return [];
  }
}


// 📁 Lấy danh sách tất cả thể loại món ăn
export async function getAllCategories() {
  try {
    const response = await axios.get(`${BASE_URL}/categories.php`);
    return response.data.categories;
  } catch (error) {
    console.error('Lỗi lấy danh sách thể loại:', error);
    return [];
  }
}

// 📂 Lấy danh sách món ăn theo thể loại
export async function getMealsByCategory(categoryName) {
  try {
    const response = await axios.get(`${BASE_URL}/filter.php?c=${categoryName}`);
    return response.data.meals;
  } catch (error) {
    console.error('Lỗi lấy món theo thể loại:', error);
    return [];
  }
}
