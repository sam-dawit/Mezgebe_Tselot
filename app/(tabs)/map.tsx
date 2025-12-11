import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Linking, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../contexts/ThemeContext';
import { api, Church } from '../../utils/api';
import { bookmarkUtils } from '../../utils/bookmarks';

const STATE_COORDINATES: { [key: string]: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number } } = {
  "Alabama": { latitude: 32.806671, longitude: -86.791130, latitudeDelta: 4, longitudeDelta: 4 },
  "Alaska": { latitude: 61.370716, longitude: -152.404419, latitudeDelta: 20, longitudeDelta: 20 },
  "Arizona": { latitude: 33.729759, longitude: -111.431221, latitudeDelta: 6, longitudeDelta: 6 },
  "Arkansas": { latitude: 34.969704, longitude: -92.373123, latitudeDelta: 4, longitudeDelta: 4 },
  "California": { latitude: 36.116203, longitude: -119.681564, latitudeDelta: 10, longitudeDelta: 10 },
  "Colorado": { latitude: 39.059811, longitude: -105.311104, latitudeDelta: 5, longitudeDelta: 5 },
  "Connecticut": { latitude: 41.597782, longitude: -72.755371, latitudeDelta: 1.5, longitudeDelta: 1.5 },
  "Delaware": { latitude: 39.318523, longitude: -75.507141, latitudeDelta: 1.5, longitudeDelta: 1.5 },
  "District of Columbia": { latitude: 38.897438, longitude: -77.026817, latitudeDelta: 0.2, longitudeDelta: 0.2 },
  "Florida": { latitude: 27.766279, longitude: -81.686783, latitudeDelta: 7, longitudeDelta: 7 },
  "Georgia": { latitude: 33.040619, longitude: -83.643074, latitudeDelta: 5, longitudeDelta: 5 },
  "Hawaii": { latitude: 21.094318, longitude: -157.498337, latitudeDelta: 4, longitudeDelta: 4 },
  "Idaho": { latitude: 44.240459, longitude: -114.478828, latitudeDelta: 8, longitudeDelta: 8 },
  "Illinois": { latitude: 40.349457, longitude: -88.986137, latitudeDelta: 6, longitudeDelta: 6 },
  "Indiana": { latitude: 39.849426, longitude: -86.258278, latitudeDelta: 4, longitudeDelta: 4 },
  "Iowa": { latitude: 42.011539, longitude: -93.210526, latitudeDelta: 4, longitudeDelta: 4 },
  "Kansas": { latitude: 38.526600, longitude: -96.726486, latitudeDelta: 4, longitudeDelta: 4 },
  "Kentucky": { latitude: 37.668140, longitude: -84.670067, latitudeDelta: 3, longitudeDelta: 3 },
  "Louisiana": { latitude: 31.169546, longitude: -91.867805, latitudeDelta: 4, longitudeDelta: 4 },
  "Maine": { latitude: 44.693947, longitude: -69.381927, latitudeDelta: 4, longitudeDelta: 4 },
  "Maryland": { latitude: 39.063946, longitude: -76.802101, latitudeDelta: 2, longitudeDelta: 2 },
  "Massachusetts": { latitude: 42.230171, longitude: -71.530106, latitudeDelta: 2, longitudeDelta: 2 },
  "Michigan": { latitude: 43.326618, longitude: -84.536095, latitudeDelta: 6, longitudeDelta: 6 },
  "Minnesota": { latitude: 45.694454, longitude: -93.900192, latitudeDelta: 6, longitudeDelta: 6 },
  "Mississippi": { latitude: 32.741646, longitude: -89.678696, latitudeDelta: 5, longitudeDelta: 5 },
  "Missouri": { latitude: 38.456085, longitude: -92.288368, latitudeDelta: 5, longitudeDelta: 5 },
  "Montana": { latitude: 46.921925, longitude: -110.454353, latitudeDelta: 8, longitudeDelta: 8 },
  "Nebraska": { latitude: 41.125370, longitude: -98.268082, latitudeDelta: 5, longitudeDelta: 5 },
  "Nevada": { latitude: 38.313515, longitude: -117.055374, latitudeDelta: 7, longitudeDelta: 7 },
  "New Hampshire": { latitude: 43.452492, longitude: -71.563896, latitudeDelta: 2, longitudeDelta: 2 },
  "New Jersey": { latitude: 40.298904, longitude: -74.521011, latitudeDelta: 2, longitudeDelta: 2 },
  "New Mexico": { latitude: 34.840515, longitude: -106.248482, latitudeDelta: 6, longitudeDelta: 6 },
  "New York": { latitude: 42.165726, longitude: -74.948051, latitudeDelta: 5, longitudeDelta: 5 },
  "North Carolina": { latitude: 35.630066, longitude: -79.806419, latitudeDelta: 4, longitudeDelta: 4 },
  "North Dakota": { latitude: 47.528912, longitude: -99.784012, latitudeDelta: 5, longitudeDelta: 5 },
  "Ohio": { latitude: 40.388783, longitude: -82.764915, latitudeDelta: 4, longitudeDelta: 4 },
  "Oklahoma": { latitude: 35.565342, longitude: -96.928917, latitudeDelta: 5, longitudeDelta: 5 },
  "Oregon": { latitude: 44.572021, longitude: -122.070938, latitudeDelta: 6, longitudeDelta: 6 },
  "Pennsylvania": { latitude: 40.590752, longitude: -77.209755, latitudeDelta: 4, longitudeDelta: 4 },
  "Rhode Island": { latitude: 41.680893, longitude: -71.511780, latitudeDelta: 1, longitudeDelta: 1 },
  "South Carolina": { latitude: 33.856892, longitude: -80.945007, latitudeDelta: 4, longitudeDelta: 4 },
  "South Dakota": { latitude: 44.299782, longitude: -99.438828, latitudeDelta: 5, longitudeDelta: 5 },
  "Tennessee": { latitude: 35.747845, longitude: -86.692345, latitudeDelta: 3, longitudeDelta: 3 },
  "Texas": { latitude: 31.054487, longitude: -97.563461, latitudeDelta: 10, longitudeDelta: 10 },
  "Utah": { latitude: 40.150032, longitude: -111.862434, latitudeDelta: 6, longitudeDelta: 6 },
  "Vermont": { latitude: 44.045876, longitude: -72.710686, latitudeDelta: 2, longitudeDelta: 2 },
  "Virginia": { latitude: 37.769337, longitude: -78.169968, latitudeDelta: 4, longitudeDelta: 4 },
  "Washington": { latitude: 47.400902, longitude: -121.490494, latitudeDelta: 5, longitudeDelta: 5 },
  "West Virginia": { latitude: 38.491226, longitude: -80.954453, latitudeDelta: 3, longitudeDelta: 3 },
  "Wisconsin": { latitude: 44.268543, longitude: -89.616508, latitudeDelta: 5, longitudeDelta: 5 },
  "Wyoming": { latitude: 42.755966, longitude: -107.302490, latitudeDelta: 6, longitudeDelta: 6 }
};

const STATES = ["All States", ...Object.keys(STATE_COORDINATES).sort()];

export default function MapScreen() {
  const { churchId } = useLocalSearchParams<{ churchId: string }>();
  const { colors } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedState, setSelectedState] = useState("All States");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermissionDenied(true);
        Alert.alert(
          'Location not enabled',
          'We could not access your location. You can still browse churches by state.',
        );
        return;
      }

      setLocationPermissionDenied(false);
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  useEffect(() => {
    loadChurches();
  }, [selectedState]);

  useEffect(() => {
    if (churchId && churches.length > 0) {
      const church = churches.find(c => c._id === churchId);
      if (church) {
        handleMarkerPress(church);
        if (mapRef.current && church.location) {
          mapRef.current.animateToRegion({
            latitude: church.location.coordinates[1],
            longitude: church.location.coordinates[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }
      }
    }
  }, [churchId, churches]);

  const loadChurches = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      console.log('Fetching churches for state:', selectedState);
      const stateParam = selectedState === "All States" ? undefined : selectedState;
      const data = await api.getChurches(stateParam);
      console.log('Fetched churches:', data.length);
      setChurches(data);

      if (data.length === 0) {
        if (stateParam) {
          setErrorMessage('No churches found in this state yet.');
        } else {
          setErrorMessage('No churches available yet.');
        }
      }
    } catch (error) {
      console.error('Error fetching churches:', error);
      setChurches([]);
      setErrorMessage('Unable to load churches right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setModalVisible(false);
    
    if (state !== "All States" && mapRef.current) {
      const region = STATE_COORDINATES[state];
      if (region) {
        mapRef.current.animateToRegion(region, 1000);
      }
    } else if (state === "All States" && mapRef.current) {
      // Reset to US view
      mapRef.current.animateToRegion({
        latitude: 39.8283,
        longitude: -98.5795,
        latitudeDelta: 40,
        longitudeDelta: 40,
      }, 1000);
    }
  };

  const handleMarkerPress = async (church: Church) => {
    setSelectedChurch(church);
    const bookmarked = await bookmarkUtils.isChurchBookmarked(church._id);
    setIsBookmarked(bookmarked);
    bottomSheetRef.current?.expand();
  };

  const toggleBookmark = async () => {
    if (!selectedChurch) return;
    
    if (isBookmarked) {
      await bookmarkUtils.removeChurchBookmark(selectedChurch._id);
      setIsBookmarked(false);
    } else {
      await bookmarkUtils.addChurchBookmark(selectedChurch);
      setIsBookmarked(true);
    }
  };

  const centerMapOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };

  const openDirections = (church: Church) => {
    if (!church.location || !church.location.coordinates) return;
    
    const [long, lat] = church.location.coordinates;
    const label = encodeURIComponent(church.name);
    
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${long}`,
      android: `geo:0,0?q=${lat},${long}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const renderCarouselItem = ({ item }: { item: Church }) => (
    <TouchableOpacity 
      style={[styles.carouselItem, { backgroundColor: colors.surface }]}
      onPress={() => {
        handleMarkerPress(item);
        if (mapRef.current && item.location) {
          mapRef.current.animateToRegion({
            latitude: item.location.coordinates[1],
            longitude: item.location.coordinates[0],
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }}
    >
      <View style={styles.carouselContent}>
        <Text style={[styles.carouselTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.carouselState, { color: colors.textSecondary }]}>{item.state}</Text>
      </View>
      <View style={styles.carouselIcon}>
        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        showsUserLocation={true}
        initialRegion={{
          latitude: 39.8283, // Center of US
          longitude: -98.5795,
          latitudeDelta: 40,
          longitudeDelta: 40,
        }}
      >
        {churches
          .filter(church => church.location && church.location.coordinates)
          .map((church) => (
          <Marker
            key={church._id}
            coordinate={{
              latitude: church.location.coordinates[1],
              longitude: church.location.coordinates[0],
            }}
            title={church.name}
            description={church.state}
            onPress={() => handleMarkerPress(church)}
            tracksViewChanges={false}
            zIndex={1}
          />
        ))}
      </MapView>

      {/* State Filter Button */}
      <TouchableOpacity 
        style={[styles.filterButton, { backgroundColor: colors.surface }]} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.filterText, { color: colors.text }]}>{selectedState}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </TouchableOpacity>

      {/* My Location Button */}
      <TouchableOpacity 
        style={[
          styles.locationButton,
          { 
            backgroundColor: colors.surface,
            opacity: locationPermissionDenied || !location ? 0.5 : 1,
          },
        ]} 
        onPress={centerMapOnUser}
        disabled={locationPermissionDenied || !location}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </TouchableOpacity>

      {/* Church Carousel */}
      {!selectedChurch && !loading && churches.length > 0 && (
        <View style={styles.carouselContainer}>
          <FlatList
            data={churches}
            renderItem={renderCarouselItem}
            keyExtractor={(item) => item._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={Dimensions.get('window').width * 0.8 + 15} // Item width + gap
            decelerationRate="fast"
            contentContainerStyle={styles.carouselList}
          />
        </View>
      )}

      {/* Empty-state messaging */}
      {!selectedChurch && !loading && churches.length === 0 && errorMessage && (
        <View style={styles.emptyStateContainer}>
          <Text style={[styles.emptyStateText, { color: colors.text }]}>{errorMessage}</Text>
        </View>
      )}

      {/* State Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select State</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.stateItem} 
                  onPress={() => handleStateSelect(item)}
                >
                  <Text style={[styles.stateText, { color: colors.text }]}>{item}</Text>
                  {selectedState === item && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Church Details Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['35%']}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
        onClose={() => setSelectedChurch(null)}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedChurch && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={[styles.churchName, { color: colors.text, flex: 1 }]}>{selectedChurch.name}</Text>
                <TouchableOpacity onPress={toggleBookmark}>
                  <Ionicons 
                    name={isBookmarked ? "bookmark" : "bookmark-outline"} 
                    size={24} 
                    color={colors.primary} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={[styles.churchState, { color: colors.primary }]}>{selectedChurch.state}</Text>
              {selectedChurch.description && (
                <Text style={[styles.churchDesc, { color: colors.textSecondary }]}>{selectedChurch.description}</Text>
              )}
              {selectedChurch.address && (
                <View style={styles.addressContainer}>
                  <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.churchAddress, { color: colors.textSecondary }]}>{selectedChurch.address}</Text>
                </View>
              )}
              {selectedChurch.website && (
                <TouchableOpacity 
                  style={styles.websiteContainer}
                  onPress={() => Linking.openURL(selectedChurch.website!)}
                >
                  <Ionicons name="globe-outline" size={16} color={colors.primary} />
                  <Text style={[styles.churchWebsite, { color: colors.primary }]} numberOfLines={1}>
                    {selectedChurch.website.replace(/^https?:\/\//, '')}
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.directionsButton, { backgroundColor: colors.primary }]}
                onPress={() => openDirections(selectedChurch)}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  filterButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    position: 'absolute',
    bottom: 150, // Moved up to make room for carousel
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  stateText: {
    fontSize: 16,
  },
  bottomSheetContent: {
    padding: 20,
  },
  churchName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  churchState: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  churchDesc: {
    fontSize: 16,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  churchAddress: {
    fontSize: 14,
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  churchWebsite: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: 90,
  },
  carouselList: {
    paddingHorizontal: 20,
    gap: 15,
  },
  carouselItem: {
    width: Dimensions.get('window').width * 0.8,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  carouselContent: {
    flex: 1,
    marginRight: 10,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  carouselState: {
    fontSize: 14,
  },
  carouselIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    gap: 8,
  },
  directionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  emptyStateContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
