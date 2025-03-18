import AsyncStorage from '@react-native-async-storage/async-storage';


//sepet verisini alır, eğer yoksa boş bir dizi oluşturur
export const addToCart = async (product) => {
  try {
    const currentCart = await AsyncStorage.getItem('cartItems');
    let cartItems = currentCart ? JSON.parse(currentCart) : [];

    //ürün var mı kontrol et, yoksa ekle
    const productIndex = cartItems.findIndex(item => item.id === product.id);

    if (productIndex === -1) {
      //yoksa ekle
      cartItems.push({ ...product, quantity: 1 });
    } else {
      //var ise miktarı arttır
      cartItems[productIndex].quantity += 1;
    }

    await AsyncStorage.setItem('cartItems', JSON.stringify(cartItems));
    console.log("Product added to cart:", product);
  } catch (error) {
    console.error("Error adding item to cart", error);
  }
};

//sepetten ürün kaldır
export const removeFromCart = async (productId) => {
  try {
    const currentCart = await AsyncStorage.getItem('cartItems');
    let cartItems = currentCart ? JSON.parse(currentCart) : [];

    const updatedCart = cartItems.filter(item => item.id !== productId);
    await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCart));
    return updatedCart;
  } catch (error) {
    console.error("Error removing item from cart", error);
  }
};

//Toplam ürün sayısını al
export const getCartItemCount = async () => {
  try {
    const cartItems = await AsyncStorage.getItem('cartItems');
    if (cartItems) {
      const items = JSON.parse(cartItems);
      return items.reduce((sum, item) => sum + item.quantity, 0);
    }
    return 0;
  } catch (error) {
    console.error("Error getting cart item count", error);
    return 0;
  }
};