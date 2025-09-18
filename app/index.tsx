import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';

import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './footer';
import info from "./info.json";
import { ConfirmDeleteModal, CreateModal } from './modals';

export default function Index() {
  const [isSharing, setIsSharing] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [folderList, setFolderList] = useState<any[]>([]);
  const [renamingUri, setRenamingUri] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const rootDir = Paths.document.uri+"Home/";

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const[createModalVisible,setCreateModalVisible] = useState(false)
  const[currentFile,setCurrentFile] = useState<File|Directory|null>(null)
  
  const [currentDir, setCurrentDir] = useState(rootDir || '');
  const { path } = useLocalSearchParams<{ path: string }>();

  const router = useRouter();

  // setup notes directory to save all files
  useEffect(() => {
    const setupNotesDir = async () => {
      try {
        const baseDir = new File(rootDir);
        if (!baseDir.exists) {
          await baseDir.create({ intermediates: true });
          console.log("Notes directory created:", baseDir.uri);
        }
         // generate folder structure from info.json
      if (info.folders && info.folders.length > 0) {
        await generateFolders(rootDir, info.folders);
      }
        setCurrentDir(rootDir);
        refreshData();
      } catch (error) {
        console.error("Error setting up notes directory:", error);
      }
    };
    setupNotesDir();
  }, []);

  // recursive folder creation
const generateFolders = async (basePath: string, folders: any[]) => {
  for (const folder of folders) {
    const folderPath = basePath + folder.name + "/";
    const dir = await new Directory(folderPath);
    if (!dir.exists) {
      await dir.create({ intermediates: true });
      console.log("Created folder:", dir.uri);
    }
    if (folder.subfolders && folder.subfolders.length > 0) {
      await generateFolders(folderPath, folder.subfolders);
    }
  }
};

  const refreshData = useCallback(async () => {
    try {
      const items = await new Directory(currentDir).list();
      const files: File[] = [];
      const folders: Directory[] = [];

      await Promise.all(
        items.map(async (item) => {
          if (item instanceof Directory) {
            folders.push(item);
          } else {
            const lower = item.uri.toLowerCase();
            if (
              lower.endsWith('.html') ||
              lower.endsWith('.jpg') ||
              lower.endsWith('.jpeg') ||
              lower.endsWith('.png') ||
              lower.endsWith('.heic') ||
              lower.endsWith('.pdf')
            ) {
              files.push(item);
            }
          }
        })
      );

      folders.sort((a, b) => a.uri.split('/').pop()!.localeCompare(b.uri.split('/').pop()!));
      files.sort((a, b) => a.uri.split('/').pop()!.localeCompare(b.uri.split('/').pop()!));

      setFolderList(folders);
      setFileList(files);
    } catch (error) {
      console.error('Error reading directory:', error);
    }
  }, [currentDir]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  useEffect(() => {
    if (path) {
      setCurrentDir(path + '/');
    }
  }, [path]);

  const openFile = async(uri: string) => {
    const filename = uri.split('/').pop()!;
    const lower = filename.toLowerCase();
    const encodedPath = encodeURIComponent(uri);

    if (lower.endsWith('.html')) {
      router.push(`/note?path=${encodedPath}`);
    } else if (
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.png') ||
      lower.endsWith('.heic')
    ) {
      router.push(`/image?path=${encodedPath}`);
    } else if (lower.endsWith('.pdf')) {
      //router.push(`/pdfview?path=${encodedPath}`);
    }
  };

  const openFolder = (uri: string) => {
    setCurrentDir(uri.endsWith('/') ? uri : uri + '/');
  };

  const loadPrevious = () => {
    if (currentDir === rootDir) {
      console.log("Already at root");
      refreshData();
      return;
    }
    const cleanUri = currentDir.endsWith('/') ? currentDir.slice(0, -1) : currentDir;
    const lastSlashIndex = cleanUri.lastIndexOf('/');
    setCurrentDir(cleanUri.slice(0, lastSlashIndex + 1));
  };

  const deleteItem = async (item: File|Directory|null) => {
    if(item){
    try {
        await item.delete();
        await refreshData();
        console.log("Deleted:", item.uri);
        setCurrentFile(null);
        setDeleteModalVisible(false);
    } catch (error) {
        console.error("Error deleting item:", error);
    }
  }};
  const handleDelete = async (item :File|Directory)=> {
    setDeleteModalVisible(true)
    setCurrentFile(item)
  }

  const handleCreate = async(data:any)=>{
      console.log('clicked on create handler',data)
      if(data.isFolder==true){
        if (!data.fileName.trim()) {
            Alert.alert("Folder name cannot be empty");
            return;
          }
          try {
            const dir =  new Directory(`${currentDir}${data.fileName}`);
            await dir.create()
            refreshData();
          } catch (error) {
            console.error('Error creating folder:', error);
          }
      }else{
        if (!data.fileName.trim()) {
            Alert.alert("File name cannot be empty");
            return;
          }
          try {
            const file =  new File(`${currentDir}${data.fileName}.html`)
            await file.create()
            refreshData();
          } catch (error) {
            console.error('Error creating file:', error);
          }}
      setCreateModalVisible(false);
  }

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'image/jpeg',
          'image/jpg',
          'image/heic',
          'image/png',
          'text/html'
        ],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = new File(result.assets[0].uri);
        const destinationUri = currentDir + file.name;
        file.move(new File(destinationUri))
        refreshData();
      }
    } catch (error) {
      console.error('Error picking or copying file:', error);
    }
  };

  const shareFile = async (item:File|Directory) => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      if (!item.exists) {
        console.log('[File not found]');
        return;
      }

      const lower = item.uri.toLowerCase();

      if (lower.endsWith('.html')) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(item.uri, {
            mimeType: "text/html",
            dialogTitle: "Share My File",
          });
        }
      } else if (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.heic') 
       
      ) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(item.uri, {
            mimeType: "image/*",
            dialogTitle: "Share File",
          });
        }
      } else {
        console.log("Unsupported file type for sharing");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
    } finally {
      setIsSharing(false);
    }
  };
  const renderFooter = ()=>{
    return <Footer uri={currentDir}/>
  }

  const getRelativePath = (path: string) => {
    if (!path) return "";
    return path.replace(Paths.document.uri || "", "");
  };

  const renderList = (list: Directory[]| File[], isFolder: boolean) => {
    if (!list.length) {
      return 
    }
    return list.map((item, index) => {
      let fullName = item.uri
      if(fullName.endsWith('/'))fullName = fullName.slice(0,-1);
      fullName = fullName.split('/').pop()!;
      fullName = fullName.replace(/%20/g," ")
      const lower = item.uri.toLowerCase();

      // remove extension only for display
      let displayName = fullName;
      if (item instanceof File) {
        const dotIndex = fullName.lastIndexOf(".");
        if (dotIndex > 0) {
          displayName = fullName.substring(0, dotIndex);
        }
      }

      let iconName: any = 'file-alt';
      let iconColor = "#f5f4ec";

      if (item instanceof Directory) {
        iconName = 'folder';
        iconColor = "#f5f4ec";
      } else if (
        lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.heic')
      ) {
        iconName = 'image';
        iconColor = "#f5f4ec";
      } 

      const startRename = () => {
        setRenamingUri(item.uri);
        setNewName(displayName);
      };

      const confirmRename = async () => {
        if (!newName.trim() || newName === displayName) {
          setRenamingUri(null);
          return;
        }
        try {
          let finalName = newName;
          if (!isFolder) {
            const ext = fullName.includes(".") ? fullName.substring(fullName.lastIndexOf(".")) : "";
            finalName = newName + ext;
          }
          const newPath = currentDir + finalName;
          if(isFolder){
              const dir = new Directory(item.uri)
              dir.move(new Directory(newPath))
              console.log(`Renamed: ${item.uri} → ${dir.uri}`);
          }else{
              const file = new File(item.uri)
              file.move(new File(newPath));
              console.log(`Renamed: ${item.uri} → ${file.uri}`);
          }
          setRenamingUri(null);
          refreshData();
        } catch (error) {
          console.error("Error renaming item:", error);
        }
      };

      return (
        <View key={index} style={styles.fileItem}>
          <View style={styles.iconTextRow}>
            <FontAwesome5 name={iconName} size={20} color={iconColor} />

            {renamingUri === item.uri ? (
              <TextInput
                value={newName}
                onChangeText={setNewName}
                onBlur={confirmRename}
                onSubmitEditing={confirmRename}
                autoFocus
                style={styles.renameInput}
              />
            ) : (
              <Pressable onLongPress={startRename}  onPress={() => isFolder ? openFolder(item.uri) : openFile(item.uri)} >
                <Text style={styles.text} numberOfLines={1} ellipsizeMode="middle">{displayName}</Text>
              </Pressable>
            )}
          </View>

          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={() => handleDelete(item)}>
              <FontAwesome5 name='trash' size={24} color="#3b1f1f" />
            </Pressable>
            {!isFolder  && (
              <Pressable style={styles.button} onPress={() => shareFile(item)}>
                <Ionicons name='share-social' size={24} color="#3b1f1f" />
              </Pressable>
            )}
          </View>
        </View>
      );
    });
  };

 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
      <View style={[styles.row,styles.space]}>
        <Pressable style={styles.button} onPress={loadPrevious}>
          <FontAwesome5 name='arrow-left' size={25} color="#4b2d23" />
        </Pressable>
        <Text style={styles.title}  numberOfLines={1} ellipsizeMode="middle">{getRelativePath(currentDir)}</Text>
         <Pressable style={styles.button} onPress={()=>setCreateModalVisible(true)}>
          <FontAwesome5 name='file-medical' size={25} color="#3b1f1f" />
        </Pressable>
         <Pressable style={styles.button} onPress={pickFile}>
          <FontAwesome5 name='paperclip' size={25} color="#3b1f1f" />
        </Pressable>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }}enableOnAndroid={true} extraScrollHeight={80}>  
      <ScrollView style={styles.scroll}>
        {renderList(folderList, true)}
        {renderList(fileList, false)}
      </ScrollView>
    </KeyboardAwareScrollView> 
    {renderFooter()}
    <ConfirmDeleteModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={() => deleteItem(currentFile)}
      />
    <CreateModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onConfirm={(data) => handleCreate(data)}
      />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#deceac' },
  title: {flex:1, fontSize: 20, fontWeight: 'bold',  textAlign: 'center', color: '#4b2d23' },
  space:{marginVertical:20},
  mainTitle: { fontSize: 25, fontWeight: 'bold', marginBottom: 20, marginLeft: '5%', marginTop: '5%', color: '#555',textAlign:"center" },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, gap: 10, width: '100%', padding: 5, borderRadius: 20, justifyContent: 'space-between', borderColor: '#ccc', borderWidth: 2 },
  input: { flex: 1, borderWidth: 1, borderColor: '#f0f0f0', borderRadius: 5, padding: 10 },
  placeholder: { position: "absolute", left: '10%', top: "40%", fontSize: 18, fontWeight: 'bold', color: '#555' },
  scroll: { flex: 1 },
  fileItem: { flexDirection: 'row',alignItems:'center',backgroundColor:"#b4906c", justifyContent: 'space-between', marginBottom: 25, width: '100%', borderColor: '#4b2d23', borderWidth: 2, padding: 10, borderRadius: 20, },
  buttonRow: { flexDirection: 'row', gap: 5 },
  row: { flexDirection: 'row', justifyContent: 'flex-start', gap: '10%' },
  button: { padding: 5, borderRadius: 5 },
  text: { flex:1, fontSize: 17, fontWeight: 'bold', color: '#4b2d23', marginLeft: 8, marginRight: 10,paddingTop:5 },
  iconTextRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  renameInput: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#333', marginLeft: 8, borderBottomWidth: 1, borderColor: '#aaa', padding: 2 }
});
