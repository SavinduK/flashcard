import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type deleteProp = {visible:boolean,onCancel:()=>void,onConfirm:()=>void}
type addProp = {visible:boolean,onCancel:()=>void,onConfirm:(data:{isFolder:boolean;fileName:string})=>void}

export const ConfirmDeleteModal:React.FC<deleteProp> = ({ visible, onCancel, onConfirm }) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel} // handles Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Delete Confirmation</Text>
          <Text style={styles.message}>
            Are you sure you want to delete this item?
          </Text>

          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.delete]} onPress={onConfirm}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View></View></View>
    </Modal>
  );
};

export const CreateModal:React.FC<addProp> = ({ visible, onCancel, onConfirm }) => {
    const [isFolder,setIsFolder] = useState(false)
    const [isFocused,setFocus] = useState(false)
    const [fileName,setFileName] = useState('')

    const submit = ()=>{
        onConfirm({isFolder,fileName});
        setIsFolder(false);
        setFileName('')
    }
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel} // handles Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.itemtRow}>
          <Text style={styles.title}>Create File</Text>
           <View style={styles.actions}>
            <Pressable style={isFolder?styles.selectedButton:styles.button} onPress={()=>setIsFolder(true)}>
              <Text style={isFolder?styles.lightText:styles.darkText}>Folder</Text>
            </Pressable>
            <Pressable style={isFolder?styles.button:styles.selectedButton} onPress={()=>setIsFolder(false)}>
              <Text style={isFolder?styles.darkText:styles.lightText}>File</Text>
            </Pressable>
          </View></View>
            <View style={styles.inputRow}>
                {!isFocused && !fileName && (
                  <Text style={styles.placeholder}>Create New File...</Text>
                )}
                <TextInput
                  value={fileName}
                  onChangeText={setFileName}
                  style={styles.input}
                  onFocus={() => setFocus(true)}
                  onBlur={() => setFocus(false)}
                />
                </View>
          <View style={styles.actions}>
            <Pressable style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.darkText}>Cancel</Text>
            </Pressable>

            <Pressable style={[styles.button, styles.submit]} onPress={()=>submit()}>
              <Text style={styles.lightText}>Submit</Text>
            </Pressable>
          </View></View></View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {flex: 1,backgroundColor: "rgba(0,0,0,0.5)",justifyContent: "center",alignItems: "center",},
  container: {backgroundColor: "#cec1ab",padding: 20,borderRadius: 12,width: "80%",elevation: 5,},
  title: {fontSize: 17,fontWeight: "600",color:'#4b2d23'},
  message: {fontSize: 15,color: "#555",marginBottom: 20,},
  actions: {flexDirection: "row",justifyContent: "flex-end",},
  button: {paddingVertical: 8,paddingHorizontal: 16,borderRadius: 8,marginLeft: 10,},
  selectedButton: {paddingVertical: 8,paddingHorizontal: 16,borderRadius: 8,marginLeft: 10,backgroundColor:'#4b2d23'},
  cancel: {backgroundColor: "#eee",},
  delete: {backgroundColor: "#4b2d23",},
  submit: {backgroundColor: "#4b2d23",},
  darkText: {color: "#4b2d23",fontWeight: "500",},
  lightText: {color: "#fff",fontWeight: "600",},
  cancelText: {color: "#333",fontWeight: "500",},
  deleteText: {color: "#fff",fontWeight: "600",},
  inputRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, width: '100%', borderRadius: 20, justifyContent: 'space-between', borderColor: '#4b2d23', borderWidth: 2 },
  itemtRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'space-between'},
  input: { flex: 1,},
  placeholder: { position: "absolute", left: '5%', top: "20%", fontSize: 15, fontWeight: 'bold', color: '#4b2d23' },
});


