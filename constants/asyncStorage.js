import AsyncStorage from '@react-native-async-storage/async-storage';

// STORE LOCAL DATA (KEY, VALUE)
export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error storing data:", error);
  }
};

// GET LOCAL DATA (VALUE) BY KEY
export const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);  // Use getItem to retrieve data
    return value;
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
};
