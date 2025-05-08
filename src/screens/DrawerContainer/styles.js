// styles.js
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: "#fff", // màu nền menu nếu muốn
  },
  container: {
    flex: 1,
    justifyContent: "flex-start", // đẩy các button lên trên
    marginTop: 60, // hoặc dùng giá trị âm để dịch lên cao hơn nữa nếu cần
    paddingHorizontal: 20,
  },
});

export default styles;