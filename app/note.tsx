import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RichEditor, RichToolbar, actions } from "react-native-pell-rich-editor";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const navigation = useNavigation();

  const { path } = useLocalSearchParams<{ path: string }>();
  const [note, setNote] = useState('');
  const [uri, setUri] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [html, setHtml] = useState(''); // store content as HTML

  const richText = useRef<RichEditor>(null);

  useEffect(() => {
    if (path) {
      setNote(path.substring(path.lastIndexOf('/') + 1));
      setUri(path.substring(0, path.lastIndexOf('/')));
    }
  }, [path]);

  // Save on back button/swipe
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", () => {
      saveFile();
    });
    return unsubscribe;
  }, [navigation, html, path]);

  const createFile = () => {
    const encodedPath = encodeURIComponent(uri);
    router.push(`/?path=${encodedPath}`);
  };

  const saveFile =  () => {
    if (!path) return;
    try {
      const file = new File(path);
      if(!file.exists)file.create();
      file.write(html);
      console.log('File saved to:', path);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const loadContent =  () => {
    try {
      const file = new File(path)
      if (file.exists) {
        const content = file.textSync();
        setHtml(content);
      } else {
        console.log('[File not found]');
      }
    } catch (error) {
      console.log('[Error reading file]');
    }
  };

  const shareFile = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const file = new File(path);
      file.write(html);
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        console.log("Sharing not available");
        return;
      }
      await Sharing.shareAsync(path, {
        mimeType: "text/html",
        dialogTitle: "Share My Note",
      });
    } catch (error) {
      console.error("Error sharing file:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const exportFile = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const file = new File(path);
      file.write(html);
      const { uri } = await Print.printToFileAsync({
        html: html, // already formatted HTML
      });
      const pdfName = note.replace(/\.[^/.]+$/, "") + ".pdf"; 
      const newPath = `${Paths.document.uri}${pdfName}`;
      //new File(uri).move(Paths(newPath));
      const available = await Sharing.isAvailableAsync();
      //new File(newPath).delete();
      if (available) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Export as PDF",
        });
      }
    } catch (error) {
      console.error("Error exporting file:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const insertImage = async()=>{
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64:true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const {base64,type} = result.assets[0];
      const uri = `data:${type};base64,${base64}`
      // insert image into editor
      richText.current?.insertImage(uri,);
    } else {
      Alert.alert("No image selected");
    }
  }

  useEffect(() => {
    loadContent();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("refreshed");
      loadContent();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headingRow}>
        <FontAwesome5 name='file-code' size={20} color='#4b2d23' />
        <Text style={styles.title}>{note} - NotePad</Text>
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={styles.button} onPress={createFile}>
          <Text style={styles.text}>New</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={saveFile}>
          <Text style={styles.text}>Save</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={shareFile}>
          <Text style={styles.text}>Share</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={exportFile}>
          <Text style={styles.text}>Export</Text>
        </Pressable>
      </View>
      <RichToolbar
        editor={richText}
        actions={[
          actions.undo,
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.checkboxList,
          actions.insertBulletsList,
          actions.insertOrderedList,
          actions.insertImage,
          actions.alignCenter,
          actions.alignLeft,
          actions.alignRight,
        ]}
        iconTint='#4b2d23'
        selectedIconTint = '#fff'
        style={styles.toolbar}
        iconMap = {{[actions.insertImage]:()=>(<Pressable onPress={insertImage}>
          <FontAwesome5 name='images' size={17} color='#4b2d23'/></Pressable>)}}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
      <RichEditor
        ref={richText}
        style={styles.editor}
        initialContentHTML={html}
        onChange={setHtml}
        placeholder="Start typing..."
        editorStyle={{
          backgroundColor: '#fff', // white paper
          cssText: `
            body {
              background-image: repeating-linear-gradient(
                to bottom,
                transparent 0px,
                transparent 23px,
                 #4a90e2 24px
              );
              background-size: 100% 24px; 
              line-height: 20px; 
              padding: 10px;
              font-size: 16px;
            }
          `,
        }}
      />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {flex: 1,padding: 5,backgroundColor: '#deceac',},
  scroll:{flexGrow:1},
  editor: {flex: 1,margin:2,borderRadius:20},
  toolbar: {backgroundColor: '#deceac',},
  title: {fontSize: 16,fontWeight: 'bold',color: '#4b2d23',},
  buttonRow: {flexDirection: 'row',justifyContent: 'space-around',gap: 5,marginBottom: 5,},
  headingRow: {flexDirection: 'row',justifyContent: 'flex-start',padding: 10,gap: 10,},
  button: {paddingHorizontal: 10,paddingVertical:5,backgroundColor:'#4b2d23',borderRadius:20},
  text: {fontSize: 16,fontWeight: 'bold',color: '#f0f0f0',},
});
