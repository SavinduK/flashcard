import { FontAwesome5 } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from "expo-print";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

  const saveFile = async () => {
    if (!path) return;
    try {
      await FileSystem.writeAsStringAsync(path, html, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log('File saved to:', path);
    } catch (error) {
      console.error('Error saving file:', error);
    }
  };

  const loadContent = async () => {
    try {
      const fileExists = await FileSystem.getInfoAsync(path);
      if (fileExists.exists) {
        const content = await FileSystem.readAsStringAsync(path);
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
      await FileSystem.writeAsStringAsync(path, html, {
        encoding: FileSystem.EncodingType.UTF8,
      });
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
      await FileSystem.writeAsStringAsync(path, html, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const { uri } = await Print.printToFileAsync({
        html: html, // already formatted HTML
      });
      const pdfName = note.replace(/\.[^/.]+$/, "") + ".pdf"; 
      const newPath = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(newPath, {
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
        <FontAwesome5 name='file-code' size={20} color='#555' />
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
          actions.setBold,
          actions.setItalic,
          actions.setUnderline,
          actions.heading1,
          actions.insertBulletsList,
          actions.insertOrderedList,
        ]}
        style={styles.toolbar}
      />
      <RichEditor
        ref={richText}
        style={styles.editor}
        initialContentHTML={html}
        onChange={setHtml}
        placeholder="Start typing..."
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    backgroundColor: '#f0f0f0',
  },
  editor: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  toolbar: {
    backgroundColor: '#eee',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 5,
    marginBottom: 5,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 10,
    gap: 10,
  },
  button: {
    padding: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
});
