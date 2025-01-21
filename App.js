import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { StatusBar } from "expo-status-bar";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

const Stack = createStackNavigator();

function LoginScreen({ navigation }) {
  console.log("Rendering LoginScreen");
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>SignUp App</Text>
      <Button title='Login with Email' onPress={() => navigation.navigate("Main")} />
      <Button title='Login with Google' onPress={() => navigation.navigate("Main")} />
      <Button title='Login with Apple' onPress={() => navigation.navigate("Main")} />
    </View>
  );
}

function MainScreen() {
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.0922);
  const [signCount, setSignCount] = useState(0);
  const [locations, setLocations] = useState([]);

  const handleLocationSelect = (data, details) => {
    const { lat, lng } = details.geometry.location;
    setRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: zoomLevel,
      longitudeDelta: zoomLevel,
    });
    console.log(`Selected location: Latitude ${lat}, Longitude ${lng}`);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.max(prev - 0.005, 0.001));
  const handleZoomOut = () => setZoomLevel((prev) => Math.min(prev + 0.005, 1));

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      });
    })();
  }, []);

  useEffect(() => {
    if (location) {
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitudeDelta: zoomLevel,
        longitudeDelta: zoomLevel,
      }));
    }
  }, [zoomLevel, location]);

  console.log("Rendering MainScreen");

  return (
    <View style={styles.container}>
      <Text>Enter Open House Address</Text>
      <GooglePlacesAutocomplete
        placeholder='Search'
        onPress={handleLocationSelect}
        query={{
          key: "AIzaSyDNWE3iJJTZ1wQkQUAO19C1AOkKqMIzoFA",
          language: "en",
        }}
        fetchDetails={true}
        styles={{
          textInputContainer: {
            width: "100%",
          },
          textInput: {
            height: 38,
            color: "#5d5d5d",
            fontSize: 16,
          },
        }}
      />
      {locations.map((loc, index) => (
        <Text key={index}>{`Sign ${index + 1}: Latitude ${loc.latitude}, Longitude ${loc.longitude}`}</Text>
      ))}
      {region && (
        <MapView
          style={styles.map}
          region={{
            ...region,
            latitudeDelta: zoomLevel,
            longitudeDelta: zoomLevel,
          }}
          showsUserLocation={true}
          onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
        >
          <Marker coordinate={region} title='Selected Location' />
          {locations.map((loc, index) => (
            <Marker key={index} coordinate={loc} title={`Sign ${index + 1}`} />
          ))}
        </MapView>
      )}
      <Button title='Zoom In' onPress={handleZoomIn} />
      <Button title='Zoom Out' onPress={handleZoomOut} />
      <Button
        title='Drop Sign'
        onPress={() => {
          if (selectedLocation) {
            setSignCount((prev) => prev + 1);
            setLocations((prev) => [...prev, selectedLocation]);
            console.log(`Sign Dropped at Latitude: ${selectedLocation.latitude}, Longitude: ${selectedLocation.longitude}. Total signs: ${signCount + 1}`);
          } else {
            console.log("No location selected");
          }
        }}
      />
    </View>
  );
}

export default function App() {
  console.log("Rendering App");
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        <Stack.Screen name='Login' component={LoginScreen} />
        <Stack.Screen name='Main' component={MainScreen} />
      </Stack.Navigator>
      <StatusBar style='auto' />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  map: {
    width: "100%",
    height: "50%",
  },
});
