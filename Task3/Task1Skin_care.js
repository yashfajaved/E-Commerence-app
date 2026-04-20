import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity,
  Image, FlatList, Dimensions, StatusBar, ScrollView, TextInput,
  LayoutAnimation, Platform, UIManager, Alert, ActivityIndicator
} from 'react-native';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const THEME = { primary: '#121212', accent: '#D4AF37', card: '#1E1E1E' };

// API URL - Change to your IP address
const API_URL = 'http://192.168.0.104/leohub_api';

export default function Task1Skin_care() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Welcome');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [toastMsg, setToastMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const cartAnim = useRef(new Animated.Value(height)).current;
  const bgZoomAnim = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (currentScreen === 'Welcome') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bgZoomAnim, { toValue: 1.1, duration: 8000, useNativeDriver: true }),
          Animated.timing(bgZoomAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
        ])
      ).start();
    }
  }, [currentScreen]);

  // Fetch products from database
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_skincare_products.php`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filtered products by category and search
  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/get_skincare_products.php?`;
      if (currentCategory !== 'All') {
        url += `category=${currentCategory}&`;
      }
      if (searchQuery) {
        url += `search=${searchQuery}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentScreen === 'Home') {
      fetchFilteredProducts();
    }
  }, [currentCategory, searchQuery, currentScreen]);

  const showToast = (msg) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 60, duration: 500, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastAnim, { toValue: -100, duration: 500, useNativeDriver: true })
    ]).start();
  };

  const toggleCart = (show) => {
    Animated.timing(cartAnim, { toValue: show ? 0 : height, duration: 500, useNativeDriver: true }).start();
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
    showToast(`${product.name} Added to Bag`);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    showToast('Item removed from bag');
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + parseInt(item.price), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart first');
      return;
    }
    Alert.alert(
      'Checkout',
      `Total: PKR ${getTotalPrice()}\nProceed to payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            Alert.alert('Success', 'Order placed successfully!');
            setCart([]);
            toggleCart(false);
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // --- UI SCREENS ---

  const WelcomeScreen = () => (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Animated.Image
        source={{ uri: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop' }}
        style={[styles.welcomeBgImg, { transform: [{ scale: bgZoomAnim }], opacity: 0.6 }]}
      />
      <View style={styles.overlay}>
        <View style={styles.logoCircle}><Text style={styles.logoText}>Z</Text></View>
        <Text style={styles.brandName}>ZALENE LUXE</Text>
        <TouchableOpacity
          style={styles.enterBtn}
          onPress={() => {
            LayoutAnimation.easeInEaseOut();
            setCurrentScreen('Home');
            fetchFilteredProducts();
          }}
        >
          <Text style={styles.enterBtnText}>ENTER SHOP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ProductDetailsScreen = ({ product }) => (
    <View style={styles.productBg}>
      <ScrollView>
        <Image source={{ uri: product.image_url }} style={styles.fullPageImg} />
        <TouchableOpacity style={styles.backBtnDetail} onPress={() => setSelectedProduct(null)}>
          <AntDesign name="arrowleft" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.detailContentContainer}>
          <Text style={styles.detailCategoryText}>{product.category.toUpperCase()}</Text>
          <Text style={styles.fullDetailTitle}>{product.name}</Text>
          <Text style={styles.fullDetailPrice}>PKR {product.price}</Text>

          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <AntDesign
                key={star}
                name={star <= Math.floor(product.rating) ? "star" : "staro"}
                size={16}
                color={THEME.accent}
              />
            ))}
            <Text style={styles.ratingText}> {product.rating}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.infoHeading}>PRODUCT INFORMATION</Text>
          <Text style={styles.fullDescBody}>{product.description}</Text>

          <View style={styles.stockInfo}>
            <MaterialCommunityIcons name={product.in_stock ? "check-circle" : "close-circle"} size={20} color={product.in_stock ? "#4CAF50" : "#E74C3C"} />
            <Text style={[styles.stockText, { color: product.in_stock ? "#4CAF50" : "#E74C3C" }]}>
              {product.in_stock ? "In Stock" : "Out of Stock"}
            </Text>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.fullCartBtn, !product.in_stock && styles.disabledBtn]}
          onPress={() => product.in_stock && addToCart(product)}
          disabled={!product.in_stock}
        >
          <Text style={styles.cartBtnText}>{product.in_stock ? "ADD TO BAG" : "OUT OF STOCK"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const AccountScreen = () => (
    <View style={styles.productBg}>
      <View style={styles.accountHeader}>
        <TouchableOpacity onPress={() => setCurrentScreen('Home')}>
          <AntDesign name="arrowleft" size={24} color={THEME.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PROFILE</Text>
        <TouchableOpacity onPress={() => {
          Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Yes', onPress: () => {
                setCart([]);
                setCurrentScreen('Welcome');
              }
            }
          ]);
        }}>
          <Feather name="log-out" size={20} color={THEME.accent} />
        </TouchableOpacity>
      </View>
      <View style={styles.profileSection}>
        <View style={styles.profileImageContainer}><Text style={styles.luxuryLogoChar}>Y</Text></View>
        <Text style={styles.profileName}>Yashfa Javed</Text>
        <Text style={styles.profileEmail}>yashfa.javed@zalene.com</Text>
      </View>
      <View style={styles.menuContainer}>
        {['Order History', 'Shipping Details', 'Privacy Settings'].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuItem}
            onPress={() => Alert.alert('Coming Soon', `${item} feature will be available soon!`)}
          >
            <Text style={styles.menuText}>{item}</Text>
            <AntDesign name="right" size={14} color="#555" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const CartOverlay = () => (
    <Animated.View style={[styles.cartOverlay, { transform: [{ translateY: cartAnim }] }]}>
      <View style={styles.cartHeader}>
        <Text style={styles.cartTitle}>MY LUXE BAG</Text>
        <TouchableOpacity onPress={() => toggleCart(false)}>
          <AntDesign name="close" size={24} color={THEME.accent} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {cart.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyText}>Your bag is empty</Text>
            <Text style={styles.emptySubText}>Add some luxury items to your bag</Text>
          </View>
        ) : (
          cart.map((item, i) => (
            <View key={i} style={styles.cartItem}>
              <Image source={{ uri: item.image_url }} style={styles.cartItemImg} />
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>PKR {item.price}</Text>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(i)} style={styles.removeBtn}>
                <Feather name="trash-2" size={18} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
      {cart.length > 0 && (
        <View style={styles.cartFooter}>
          <Text style={styles.totalText}>Total: PKR {getTotalPrice()}</Text>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.checkoutBtnText}>CHECKOUT</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderProductCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedProduct(item)} activeOpacity={0.9}>
      <Image source={{ uri: item.image_url }} style={styles.cardImg} />
      <View style={styles.cardOverlay}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardPrice}>Rs. {item.price}</Text>
        <TouchableOpacity
          style={[styles.quickAddBtn, !item.in_stock && styles.disabledQuickAdd]}
          onPress={() => item.in_stock && addToCart(item)}
        >
          <Text style={styles.quickAddText}>{item.in_stock ? "ADD" : "OUT"}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (currentScreen === 'Welcome') return <WelcomeScreen />;
  if (currentScreen === 'Account') return <AccountScreen />;
  if (selectedProduct) return (
    <View style={{ flex: 1 }}>
      <ProductDetailsScreen product={selectedProduct} />
      <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
        <MaterialCommunityIcons name="check-decagram" size={20} color={THEME.accent} />
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.productBg}>
      <StatusBar barStyle="light-content" />

      <Animated.View style={[styles.toastContainer, { transform: [{ translateY: toastAnim }] }]}>
        <MaterialCommunityIcons name="check-decagram" size={20} color={THEME.accent} />
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          Alert.alert('Exit', 'Go back to welcome screen?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Yes', onPress: () => setCurrentScreen('Welcome') }
          ]);
        }}>
          <AntDesign name="left" size={24} color={THEME.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ZALENE LUXE</Text>
        <TouchableOpacity onPress={() => toggleCart(true)}>
          <Feather name="shopping-bag" size={22} color={THEME.accent} />
          {cart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cart.length}</Text></View>}
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <Feather name="search" size={18} color="#888" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search collections..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Feather name="x" size={18} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ height: 50 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
          {['All', 'Serums', 'Creams', 'Cleansers', 'Bundles'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCurrentCategory(cat)}
              style={[styles.catTab, currentCategory === cat && styles.activeTab]}
            >
              <Text style={[styles.catTabText, currentCategory === cat && { color: '#121212' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.accent} />
          <Text style={styles.loadingText}>Loading luxury products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProductCard}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🛍️</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySub}>Try a different category or search term</Text>
            </View>
          }
        />
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => {
          setCurrentCategory('All');
          setSearchQuery('');
          setCurrentScreen('Home');
        }}>
          <Ionicons name="home" size={24} color={THEME.accent} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentScreen('Account')}>
          <Feather name="user" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleCart(true)}>
          <Feather name="shopping-bag" size={24} color="#888" />
          {cart.length > 0 && <View style={styles.navBadge}><Text style={styles.navBadgeText}>{cart.length}</Text></View>}
        </TouchableOpacity>
      </View>
      <CartOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeBgImg: { width: width, height: height, position: 'absolute' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  logoCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  logoText: { color: '#D4AF37', fontSize: 40, fontWeight: '200' },
  brandName: { color: '#FFF', fontSize: 28, letterSpacing: 8, fontWeight: '300' },
  enterBtn: { marginTop: 60, paddingVertical: 15, paddingHorizontal: 35, borderWidth: 0.5, borderColor: '#D4AF37' },
  enterBtnText: { color: '#D4AF37', fontSize: 12, letterSpacing: 3 },
  productBg: { flex: 1, backgroundColor: THEME.primary },
  header: { paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20, alignItems: 'center' },
  headerTitle: { color: THEME.accent, fontSize: 16, letterSpacing: 3 },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: THEME.accent, borderRadius: 7, width: 14, height: 14, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#000', fontSize: 9, fontWeight: 'bold' },
  searchSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.card, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, height: 45, marginBottom: 20 },
  searchInput: { flex: 1, color: '#FFF' },
  catTab: { paddingHorizontal: 18, height: 35, justifyContent: 'center', borderRadius: 20, borderWidth: 0.5, borderColor: '#D4AF37', marginRight: 10 },
  activeTab: { backgroundColor: '#D4AF37' },
  catTabText: { color: '#D4AF37', fontSize: 11, fontWeight: 'bold' },
  card: { width: (width / 2) - 20, backgroundColor: THEME.card, margin: 10, borderRadius: 15, overflow: 'hidden', paddingBottom: 15 },
  cardImg: { width: '100%', height: 160 },
  cardOverlay: { paddingHorizontal: 10, paddingTop: 10 },
  cardName: { color: '#EEE', fontSize: 13, fontWeight: '500' },
  cardPrice: { color: THEME.accent, fontWeight: 'bold', marginTop: 5 },
  quickAddBtn: { backgroundColor: THEME.accent, marginTop: 10, paddingVertical: 6, borderRadius: 8, alignItems: 'center' },
  quickAddText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
  disabledQuickAdd: { backgroundColor: '#555', opacity: 0.5 },
  disabledBtn: { backgroundColor: '#555', opacity: 0.5 },
  bottomNav: { position: 'absolute', bottom: 0, width: width, height: 70, backgroundColor: '#1E1E1E', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  navBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: THEME.accent, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  navBadgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  cartOverlay: { position: 'absolute', bottom: 0, width: width, height: height * 0.7, backgroundColor: '#1A1A1A', borderTopLeftRadius: 30, borderTopRightRadius: 30, zIndex: 1000 },
  cartHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 25, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  cartTitle: { color: THEME.accent, fontSize: 18 },
  cartItem: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  cartItemImg: { width: 60, height: 60, borderRadius: 10 },
  cartItemName: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  cartItemPrice: { color: THEME.accent, fontSize: 12, marginTop: 4 },
  removeBtn: { padding: 8 },
  cartFooter: { padding: 25, borderTopWidth: 0.5, borderTopColor: '#333' },
  totalText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: THEME.accent, marginTop: 10, padding: 15, borderRadius: 12, alignItems: 'center' },
  checkoutBtnText: { fontWeight: 'bold', color: '#000' },
  emptyCartContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { color: '#666', fontSize: 16, marginBottom: 8 },
  emptySubText: { color: '#555', fontSize: 12 },

  fullPageImg: { width: width, height: height * 0.5 },
  backBtnDetail: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  detailContentContainer: { padding: 25, backgroundColor: THEME.primary, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  detailCategoryText: { color: THEME.accent, fontSize: 12, letterSpacing: 2, marginBottom: 10 },
  fullDetailTitle: { color: '#FFF', fontSize: 26, fontWeight: 'bold' },
  fullDetailPrice: { color: THEME.accent, fontSize: 20, marginTop: 10, fontWeight: '500' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  ratingText: { color: '#888', fontSize: 12, marginLeft: 5 },
  divider: { height: 0.5, backgroundColor: '#333', marginVertical: 25 },
  infoHeading: { color: '#888', fontSize: 12, letterSpacing: 1, marginBottom: 15 },
  fullDescBody: { color: '#BBB', lineHeight: 22, fontSize: 15 },
  stockInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 20, gap: 8 },
  stockText: { fontSize: 13, fontWeight: '500' },
  stickyFooter: { position: 'absolute', bottom: 0, width: width, padding: 20, backgroundColor: THEME.primary, borderTopWidth: 0.5, borderTopColor: '#333' },
  fullCartBtn: { backgroundColor: THEME.accent, padding: 18, borderRadius: 15, alignItems: 'center' },
  cartBtnText: { color: '#000', fontWeight: 'bold', letterSpacing: 1 },

  accountHeader: { paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  profileSection: { alignItems: 'center', marginBottom: 40 },
  profileImageContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1E1E1E', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: THEME.accent },
  luxuryLogoChar: { color: THEME.accent, fontSize: 40 },
  profileName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  profileEmail: { color: '#888', fontSize: 13 },
  menuContainer: { paddingHorizontal: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: THEME.card, padding: 18, borderRadius: 16, marginBottom: 12 },
  menuText: { color: '#DDD' },
  toastContainer: { position: 'absolute', top: 0, left: 20, right: 20, backgroundColor: '#1A1A1A', height: 55, borderRadius: 15, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, zIndex: 2000, borderWidth: 1, borderColor: THEME.accent, shadowColor: THEME.accent, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10 },
  toastText: { color: '#FFF', marginLeft: 12, fontSize: 14, fontWeight: '500', letterSpacing: 0.5 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: THEME.accent, marginTop: 10, fontSize: 14 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyEmoji: { fontSize: 60, marginBottom: 20 },
  emptyTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptySub: { color: '#888', fontSize: 14, textAlign: 'center' },
});