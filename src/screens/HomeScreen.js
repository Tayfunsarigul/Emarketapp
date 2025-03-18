import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { addToCart } from '../utils/cartUtils';
import { addToFavorites, removeFromFavorites, getFavorites } from '../utils/favoriteUtils';
import { useCart } from '../context/CartContext';

const HomeScreen = ({ navigation }) => {
  //Ürün verilerini tutan stateler product, filteredProducts, allProducts
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceFilter, setPriceFilter] = useState('');
  const { updateCartItemCount } = useCart();
  
  // Infinite scroll states //loading ve sayfalama stateleri
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // Infinite scroll her sayfada 12 eleman getirir.
  const ITEMS_PER_PAGE = 12;

  // Filter states
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    maxPrice: null
  });

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Favori ürünleri her sayfa açıldığında yeniden yükle
  useFocusEffect(
    React.useCallback(() => {
      const loadFavorites = async () => {
        const favorites = await getFavorites();
        setFavorites(favorites);
      };
      loadFavorites();
    }, [])
  );

  // Tüm ürünleri bir kerede çek API işlemleri
  const fetchAllProducts = async () => {
    try {
      //Loading başlatma 
      setLoading(true);
      // API Endpoint (verideki resimler aynı geliyor) APIye GET isteği yaptım
      const response = await fetch('https://5fc9346b2af77700165ae514.mockapi.io/products');
      // JSON formatına çevirdim HTTP , js ye dönüşür
      const data = await response.json();
      // Gelen ürünler statede saklanır
      setAllProducts(data);
      applyFiltersAndPagination(data, 1);
    } catch (error) {
      //Hata yakalama
      console.error('Error fetching products:', error);
    } finally {
      // yüklemeyi kapatma
      setLoading(false);
    }
  };

  // Filtreleri ve sayfalamayı uygula
  const applyFiltersAndPagination = (data, currentPage, filters = activeFilters) => {
    // datadaki veriler kopyalanır orjinal verileri değiştirmez
    let filteredData = [...data];

    // Arama filtresini uygula
    if (filters.search) {
      filteredData = filteredData.filter(item =>
        item.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Fiyat filtresini uygula
    if (filters.maxPrice) {
      filteredData = filteredData.filter(item =>
        parseFloat(item.price) <= parseFloat(filters.maxPrice)
      );
    }

    // Toplam filtrelenmiş veriyi kaydet
    setProducts(filteredData);

    // Sayfalama için veriyi böl
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Sayfalanmış veriyi state'e kaydet
    if (currentPage === 1) {
      setFilteredProducts(paginatedData);
    } else {
      setFilteredProducts(prev => [...prev, ...paginatedData]);
    }

    // Daha fazla veri var mı kontrol et
    setHasMore(endIndex < filteredData.length);
    setPage(currentPage);
  };

  // Infinite scroll için loadMore fonksiyonu
  const loadMore = () => {
    // hasMore true dönerse yeni verileri yükler
    if (!loading && hasMore) {
      //Page+1 mevcut sayfayı artırır ( 2nci sayfaysa 3 e geçer)
      const nextPage = page + 1;
      applyFiltersAndPagination(allProducts, nextPage);
    }
  };

  // Arama işlemi
  const handleSearch = (text) => {
    setSearchQuery(text);
    const newFilters = {
      ...activeFilters,
      search: text
    };
    setActiveFilters(newFilters);
    applyFiltersAndPagination(allProducts, 1, newFilters);
  };

  // Footer component - yükleniyor göstergesi
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  };

  // Fiyat filtreleme işlemi
  const applyPriceFilter = () => {
    if (!priceFilter) return; // Fiyat filtre boş ise çalışmaz

    const newFilters = {
      ...activeFilters,
      maxPrice: priceFilter
    };
    //State e yeni filtreleri aktarır
    setActiveFilters(newFilters);
    //Yeni filtreleri uygular 1nci sayfadan başlatır
    applyFiltersAndPagination(allProducts, 1, newFilters);
    //Filtre modali kapatır
    setFilterModalVisible(false);
  };

  // Filtreleri temizle
  const clearFilters = () => {
    setPriceFilter('');
    setActiveFilters({
      search: '',
      maxPrice: null
    });
    setSearchQuery('');
    applyFiltersAndPagination(allProducts, 1, { search: '', maxPrice: null });
    setFilterModalVisible(false);
  };

  // Sepete ekleme işlemi fonksiyon çağırılır asenkron çalışır sepete ürün girene kadar await bekler
  const handleAddToCart = async (item) => {
    await addToCart(item);
    updateCartItemCount();
    Alert.alert('Success', `${item.name} has been added to cart!`);
  };

  // Favori işlemi
  const handleFavorite = async (item) => {
    if (favorites.some((fav) => fav.id === item.id)) {
      await removeFromFavorites(item.id);
      Alert.alert('Success', `${item.name} has been removed from favorites!`);
    } else {
      await addToFavorites(item);
      Alert.alert('Success', `${item.name} has been added to favorites!`);
    }
    // Favori listesini yenile
    const updatedFavorites = await getFavorites();
    setFavorites(updatedFavorites);
  };

  // Ürün kartı
  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <View style={styles.productContentContainer}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('ProductDetail', { product: item })}
          style={styles.productImageContainer}
        >
          <Image 
            source={{ uri: item.image }} 
            style={styles.image}
            resizeMode="cover"
          />
          <Text 
            style={styles.name} 
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text style={styles.price}>${item.price}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add to Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleFavorite(item)}
        >
          <Text style={styles.favoriteButtonText}>
            {favorites.some((fav) => fav.id === item.id) ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Filtre Butonu */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterModalVisible(true)}
      >
        <Text style={styles.filterButtonText}>
          Filters: {activeFilters.maxPrice ? `Max $${activeFilters.maxPrice}` : 'Select Filter'}
        </Text>
      </TouchableOpacity>

      {/* Ürün Listesi */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      {/* Filtre Modal'ı */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Price Filter</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter max price"
              keyboardType="numeric"
              value={priceFilter}
              onChangeText={setPriceFilter}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={applyPriceFilter}>
                <Text style={styles.buttonText}>Apply Filter</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={clearFilters}>
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFilterModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  filterButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
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
    height: 280,
    justifyContent: 'space-between',
  },
  productContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productImageContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
    height: 32,
    paddingHorizontal: 4,
  },
  price: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    height: 36,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    height: '100%',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  favoriteButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: 36,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;