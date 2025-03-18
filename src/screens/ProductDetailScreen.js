import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, Image, Alert, View, TouchableOpacity } from 'react-native';
import { addToCart } from '../utils/cartUtils';
import { addToFavorites, removeFromFavorites, getFavorites } from '../utils/favoriteUtils';

const ProductDetailScreen = ({ route, navigation }) => {
  const { product } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: product.name || product.title });
    checkFavoriteStatus();
  }, [navigation, product]);

  const checkFavoriteStatus = async () => {
    const favorites = await getFavorites();
    setIsFavorite(favorites.some(fav => fav.id === product.id));
  };

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(product.id);
        Alert.alert('Success', `${product.name} has been removed from favorites!`);
      } else {
        await addToFavorites(product);
        Alert.alert('Success', `${product.name} has been added to favorites!`);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Failed to load product information!</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    Alert.alert('Success', `${product.name || product.title} added to cart!`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: product.image }} style={styles.fullImage} />

      <Text style={styles.title}>{product.name || product.title}</Text>
      <Text style={styles.description}>{product.description}</Text>

      <View style={styles.bottomContainer}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price:</Text>
          <Text style={styles.price}>${product.price}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavorite}
          >
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  fullImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  favoriteButtonText: {
    fontSize: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductDetailScreen;
