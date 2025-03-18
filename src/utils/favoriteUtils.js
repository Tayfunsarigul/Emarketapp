import AsyncStorage from '@react-native-async-storage/async-storage';

// Favori ürün ekle
export const addToFavorites = async (product) => {
  try {
    const favorites = await AsyncStorage.getItem('favorites');
    let favoriteItems = favorites ? JSON.parse(favorites) : [];

    // Ürün zaten favorilerde mi kontrol et
    const existingItem = favoriteItems.find((item) => item.id === product.id);
    if (!existingItem) {
      favoriteItems.push(product);
      await AsyncStorage.setItem('favorites', JSON.stringify(favoriteItems));
      console.log('Favorilere eklendi:', product.title);
    } else {
      console.log('Bu ürün zaten favorilerde.');
    }
  } catch (error) {
    console.error('Favori eklenirken hata oluştu:', error);
  }
};

// Favori ürün kaldır
export const removeFromFavorites = async (productId) => {
  try {
    const favorites = await AsyncStorage.getItem('favorites');
    let favoriteItems = favorites ? JSON.parse(favorites) : [];

    // Ürünü favorilerden kaldır
    const updatedFavorites = favoriteItems.filter((item) => item.id !== productId);
    await AsyncStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    console.log('Favorilerden kaldırıldı:', productId);
  } catch (error) {
    console.error('Favori kaldırılırken hata oluştu:', error);
  }
};

// Favori ürünleri getir
export const getFavorites = async () => {
  try {
    const favorites = await AsyncStorage.getItem('favorites');
    return favorites ? JSON.parse(favorites) : [];
  } catch (error) {
    console.error('Favoriler alınırken hata oluştu:', error);
    return [];
  }
};