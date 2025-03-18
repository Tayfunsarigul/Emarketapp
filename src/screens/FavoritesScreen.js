import React, { useState, useCallback } from 'react';
import { 
  View, 
  FlatList, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFavorites, removeFromFavorites } from '../utils/favoriteUtils';
import { addToCart } from '../utils/cartUtils';
import { useCart } from '../context/CartContext';

//useCart Hook sepetteki ürün sayısını güncelleyecek
const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { updateCartItemCount } = useCart();

  // favori yükleme işlemi
  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const favoritesData = await getFavorites();
      setFavorites(favoritesData || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'An error occurred while loading favorites.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Pull-to-refresh işlemi 
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites]);

  // Yeniden yükleme işlemi, loadFavorites işlemi tekrar çalışır kullanıcı favorilere girdiğinde
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  // Favorilerden kaldırma işlemi
  const handleRemoveFavorite = useCallback(async (productId, productName) => {
    try {
      await removeFromFavorites(productId);
      const updatedFavorites = await getFavorites();
      setFavorites(updatedFavorites || []);
      Alert.alert('Success', `${productName} has been removed from favorites!`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'An error occurred while removing the product.');
    }
  }, []);

  // Sepete ekleme işlemi
  const handleAddToCart = useCallback(async (item) => {
    try {
      await addToCart(item);
      updateCartItemCount();
      Alert.alert('Success', `${item.name} has been added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the product to cart.');
    }
  }, [updateCartItemCount]);

  // Boş favoriler için component 
  const EmptyFavorites = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>You don't have any favorite products.</Text>
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  ), [navigation]);

  // Ürün kartı
  const renderItem = useCallback(({ item }) => (
    <View style={styles.productContainer}>
      <TouchableOpacity 
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        style={styles.productImageContainer}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.image}
          resizeMode="cover"
        />
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.price}>${item.price}</Text>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveFavorite(item.id, item.name)}
        >
          <Text style={styles.removeButtonText}>Remove from Favorites</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [navigation, handleAddToCart, handleRemoveFavorite]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={[
          styles.listContainer,
          favorites.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={EmptyFavorites}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  shopButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  productContainer: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  productImageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;