import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native'; // Alert burada import ediliyor
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // useFocusEffect ekleyin
import { useCart } from '../context/CartContext';

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const { updateCartItemCount } = useCart();

  // Sepetteki ürünleri yükle
  const loadCartItems = async () => {
    try {
      const storedCartItems = await AsyncStorage.getItem('cartItems');
      if (storedCartItems) {
        setCartItems(JSON.parse(storedCartItems));
      }
    } catch (error) {
      console.error("Error loading cart items", error);
    }
  };

  // useFocusEffect ile her sayfa açıldığında sepetteki ürünleri güncelle
  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [])
  );

  // Sepetteki ürün miktarını güncelle
  const updateCartItem = async (productId, action) => {
    let updatedCartItems = [...cartItems];
    const productIndex = updatedCartItems.findIndex(item => item.id === productId);

    if (productIndex !== -1) {
      if (action === 'increase') {
        updatedCartItems[productIndex].quantity += 1;
      } else if (action === 'decrease') {
        if (updatedCartItems[productIndex].quantity > 1) {
          updatedCartItems[productIndex].quantity -= 1;
        } else {
          updatedCartItems.splice(productIndex, 1); // Ürünü tamamen kaldır
        }
      }
    }

    await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    setCartItems(updatedCartItems); // State'i güncelle
    updateCartItemCount(); // Ürünler değiştiğinde sepet sayısını güncelle
  };

  // Toplam fiyatı hesapla
  const totalPrice = cartItems.reduce((total, item) => total + parseFloat(item.price) * item.quantity, 0);

  // Sepetteki ürünleri render et
  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>{item.price} TL</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => updateCartItem(item.id, 'decrease')}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => updateCartItem(item.id, 'increase')}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
      <Text style={styles.totalPrice}>Total: {totalPrice.toFixed(2)} TL</Text>
      <Button title="Confirm Order" onPress={() => Alert.alert('Your order has been received')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemName: {
    fontSize: 16,
  },
  itemPrice: {
    fontSize: 14,
    color: '#555',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: 18,
    paddingHorizontal: 10,
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 10,
  },
});

export default CartScreen;