import axios from 'axios';

// Nếu bạn chạy trên thiết bị thật -> dùng IP LAN của máy tính
const BASE_URL = '192.168.1.103';

export const fetchCategories = async () => {
  const res = await axios.get(`${BASE_URL}/categories`);
  return res.data;
};

export const fetchIngredients = async () => {
  const res = await axios.get(`${BASE_URL}/ingredients`);
  return res.data;
};

export const fetchRecipes = async () => {
  const res = await axios.get(`${BASE_URL}/recipes`);
  return res.data;
};