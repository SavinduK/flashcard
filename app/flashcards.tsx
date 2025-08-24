import * as FileSystem from "expo-file-system";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Image,
    PanResponder,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "./footer";

const Flashcards = () => {
  const { path } = useLocalSearchParams<{ path: string }>();
  const [imageUri, setImageUri] = useState<string>("");

  const position = useRef(new Animated.ValueXY()).current;

  const getRandomImage = async (folderPath: string): Promise<string> => {
    try {
      const items = await FileSystem.readDirectoryAsync(folderPath);
      const images = items.filter((item: string) => {
        const lower = item.toLowerCase();
        return (
          lower.endsWith(".jpg") ||
          lower.endsWith(".jpeg") ||
          lower.endsWith(".png") ||
          lower.endsWith(".heic")
        );
      });
      if (images.length === 0) {
        console.log("No images found in folder:", folderPath);
        return "";
      }
      const randomIndex = Math.floor(Math.random() * images.length);
      const randomImage = folderPath.endsWith("/")
        ? folderPath + images[randomIndex]
        : folderPath + "/" + images[randomIndex];
      console.log("Random image selected:", randomImage);
      return randomImage;
    } catch (error) {
      console.error("Error selecting random image:", error);
      return "";
    }
  };

  const loadImage = async () => {
    const folder = path + "/";
    const img = await getRandomImage(folder);
    setImageUri(img);
  };

  useEffect(() => {
    loadImage();
  }, []);

  // Setup swipe handler
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 20 || Math.abs(gesture.dy) > 20,
      onPanResponderRelease: async (_, gesture) => {
        if (Math.abs(gesture.dx) > 50 || Math.abs(gesture.dy) > 50) {
          await loadImage(); // load new image on swipe
        }
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Flashcard</Text>
      <View style={styles.content}> 
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.card,{ transform: position.getTranslateTransform() }]}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </Animated.View>
      </View>

      {/* Footer always at bottom */}
      <Footer />
    </SafeAreaView>
  );
};

export default Flashcards;

const styles = StyleSheet.create({
  container: {flex: 1,backgroundColor: "#f0f0f0",},
  content: {flex: 1,alignItems: "center",justifyContent:'center'},
  title: { fontSize: 25, fontWeight: 'bold', marginBottom: 20, marginLeft: '5%', marginTop: '5%', color: '#555',textAlign:"center" },
  image: {width:'100%',height:'100%',borderRadius: 16,},
  card: {
    width: "90%",
    maxWidth: 400,
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    marginBottom:20,
    justifyContent: "center",
    alignItems: "center",
  },
});
