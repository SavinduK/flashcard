import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './footer';

export default function Index() {

  const [taskTitle,setTaskTitle] = useState('');
  const [taskDescription,setTaskDescription] = useState('');
  
  const [data,setData] = useState<any[]>([]);
  const KEY = 'dbKey';

  const router = useRouter()
  const [category,setCategory] = useState('1')

  const [DeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<any>(null);


  //refresh list
  useEffect(() => {
      reloadItems();
      }, []);
 
  //save to async storage
  const storeData = async (taskTitle: string,taskDescription:string) => {
  try {
    const jsondata = await AsyncStorage.getItem(KEY);
    if(jsondata != null){
      let data = JSON.parse(jsondata);
      data.push([taskTitle,taskDescription,category,0]);//0=incomplete -1= late 1=complete
      setData(data);
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {
           console.error('Failed to save data', e);
         }
    }else{
      let data = [];
      data.push([taskTitle,taskDescription,category,0])
      setData(data)
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {
           console.error('Failed to save data', e);
         }
    }
  } catch (e) {
    console.error('Failed to fetch data', e);
    alert('error')
  }
};
  //handle data input
  const handleInput = () =>{
      setTaskTitle('')
      setTaskDescription('')
      if (taskTitle != ''){
        storeData(taskTitle,taskDescription)
      }else{
        reloadItems()
      }
    setAddModalVisible(false)  
  }
  const toggleComplete = async(index:number)=>{
    let newArray = [...data];
    newArray[index] = [...newArray[index]]; // clone item
    newArray[index][3] = newArray[index][3] === 0 ? 1 : 0;

    setData(newArray);
    console.log(newArray)
    setData(newArray)
      try {
          await AsyncStorage.setItem(KEY, JSON.stringify(newArray));
       } catch (e) {
           console.error('Failed to save data', e);
      }
    renderItems() 
  }

  //handle delete(for some bloody reason, async storage does not seem to update from pre defined function.had to call it again)
  const handleDelete = async(index:number)=>{
      const newArray = data.filter((_,i)=> i !== index)
      setData(newArray)
      try {
          await AsyncStorage.setItem(KEY, JSON.stringify(newArray));
       } catch (e) {
           console.error('Failed to save data', e);
      }}

    const deleteItem = async (index:number) => {
      handleDelete(index)
      setDeleteModalVisible(false)
      setDeleteIndex(null)
    };
  //reload items
  const reloadItems = async() =>{
    try {
    const jsontaskTitle = await AsyncStorage.getItem(KEY);
    if(jsontaskTitle != null){
      let data = JSON.parse(jsontaskTitle);
      setData(data)
    }else{
      let data: any[] = [];
      setData(data)
    }
  } catch (e) {
    console.error('Failed to fetch data', e);
    alert('error')
  }}


  const renderItems = ()=>{ 
    return data.sort((a, b) => a[3] - b[3]).map((item,index)=>
      (item[2] == category ?(
      <View key={index} style={styles.item} > 
      <View style={styles.row}>
        <Pressable onPress={() =>toggleComplete(index)}> 
          <FontAwesome5 name={item[3]==0?'square':item[3]==1?'check':null} size={25} color={item[3]==0?'#fceadb':item[3]==1?'#603a30':null} />
        </Pressable> 
        <Text style={item[3]==0?[styles.text,styles.largeText]:item[3]==1?[styles.textcrossed,styles.largeText]:null}> {item[0]}</Text> 
        <Pressable onPress={() =>{setDeleteModalVisible(true);setDeleteIndex(index)}}> 
          <FontAwesome5 name='trash' size={25} color="#cec1ab" /> 
        </Pressable>
        </View>
        <Text style={item[3]==0?[styles.text,styles.smallText]:item[3]==1?[styles.textcrossed,styles.smallText]:null}> {item[1]} </Text>
      </View>):null )) }

  useEffect(() => {
      renderItems();
    }, [renderItems]);
  
    useFocusEffect(
      useCallback(() => {
        renderItems();
      }, [renderItems])
    );

  const onCancelDelete = ()=> {
    setDeleteModalVisible(false)
  }
  const onCancelAdd =()=>{
    setAddModalVisible(false)
  }

  //view components
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <FontAwesome5 name="clipboard-list" size={30} color='#4c2b08'></FontAwesome5>
        <Text style={styles.taskTitle}>My Tasks</Text>
      </View> 

      <View style={styles.row}>
        <Pressable style={category=='1'?styles.pressableSelected:styles.pressable} onPress={() => setCategory('1')}>
           <Text style={category=='1'?styles.pressableTextSelected:styles.pressableText}>Daily</Text>
        </Pressable>
        <Pressable style={category=='2'?styles.pressableSelected:styles.pressable} onPress={() => setCategory('2')}>
           <Text style={category=='2'?styles.pressableTextSelected:styles.pressableText}>Weekly</Text>
        </Pressable>
         <Pressable style={category=='3'?styles.pressableSelected:styles.pressable} onPress={() => setCategory('3')}>
           <Text style={category=='3'?styles.pressableTextSelected:styles.pressableText}>Projects</Text>
        </Pressable>
      </View>
      
      <ScrollView style={styles.scroll} contentContainerStyle={{width:'100%'}}>
        {renderItems()}
      
      </ScrollView> 
      <Pressable style={styles.fab}  onPress={()=>setAddModalVisible(true)}>
            <FontAwesome  name="plus" size={30} color="#fff"></FontAwesome>
      </Pressable>

      <Footer/>

      <Modal //popup to delete a task
      transparent
      animationType="fade"
      visible={DeleteModalVisible}
      onRequestClose={onCancelDelete} // handles Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.containerModal}>
          <Text style={styles.titleModal}>Delete Confirmation</Text>
          <Text style={styles.text}>
            Are you sure you want to delete this item?
          </Text>

          <View style={styles.actions}>
            <Pressable style={[styles.pressable]} onPress={onCancelDelete}>
              <Text style={styles.pressableText}>Cancel</Text>
            </Pressable>

            <Pressable style={[styles.pressableSelected]} onPress={()=>deleteItem(deleteIndex)}>
              <Text style={styles.pressableTextSelected}>Delete</Text>
            </Pressable>
          </View></View></View>
    </Modal>
 
    <Modal //popup to add a task
      transparent
      animationType="fade"
      visible={addModalVisible}
      onRequestClose={onCancelAdd} // handles Android back button
    >
      <View style={styles.overlay}>
        <View style={styles.containerModal}>
          <Text style={styles.titleModal}>Add A Task</Text>
            <View style={styles.row}>
                <Text style={styles.text}>Title:</Text>
                <TextInput
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                  style={styles.input}
                />
                </View>
             <View style={styles.row}>
                <Text style={styles.text}>Description:</Text>
                <TextInput
                  value={taskDescription}
                  onChangeText={setTaskDescription}
                  style={styles.input}
                />
                </View>
          <View style={styles.actions}>
            <Pressable style={[styles.pressable]} onPress={onCancelAdd}>
              <Text style={styles.pressableText}>Cancel</Text>
            </Pressable>

            <Pressable style={[styles.pressableSelected]} onPress={()=>handleInput()}>
              <Text style={styles.pressableTextSelected}>Submit</Text>
            </Pressable>
          </View></View></View>
    </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({    
      container: {flex: 1, padding: 20, backgroundColor: '#deceac'},
      scroll: {flex: 1,},
      overlay: {flex: 1,backgroundColor: "rgba(0,0,0,0.5)",justifyContent: "center",alignItems: "center",},
      containerModal: {backgroundColor: "#cec1ab",padding: 20,borderRadius: 12,width: "80%",elevation: 5,},

      taskTitle: { fontSize: 25, fontWeight: 'bold', marginBottom: 20, marginLeft: '5%', marginTop: '5%', color: '#4c2b08',},
      titleModal: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, marginLeft: '5%', marginTop: '5%', color: '#4c2b08',},

      input: {flex: 1,borderWidth: 2,borderColor: '#4b2d23',borderRadius: 15,padding: 10,backgroundColor: '#D9c4a5',height:'110%'},
      row: {flexDirection:'row',alignItems: 'center',width:'100%',justifyContent:'space-between',padding:5},
      item: {flex:1,width:'100%',padding: 5,marginVertical: 20,backgroundColor: '#b4906c',borderRadius: 20,borderColor:'#603a30',borderWidth:2,},
      

      pressable:{backgroundColor:'#fceadb',padding: 5, borderRadius: 20 },
      pressableSelected:{backgroundColor:'#4c2b08',padding: 5, borderRadius: 20 },
      pressableText:{color:'#555', fontSize: 17, fontWeight: 'bold',paddingHorizontal:10,paddingVertical:5},
      pressableTextSelected:{color:'#fff', fontSize: 17, fontWeight: 'bold',paddingHorizontal:10,paddingVertical:5},
      actions: {flexDirection: "row",justifyContent: "flex-end",},
      selectedButton: {paddingVertical: 8,paddingHorizontal: 16,borderRadius: 8,marginLeft: 10,backgroundColor:'blue'},
      darkText: {color: "#333",fontWeight: "500",},
      lightText: {color: "#fff",fontWeight: "600",},

      text: { flex:1, fontWeight: 'bold', color: '#f5f4ec',padding:2},
      smallText: { fontSize: 14,paddingHorizontal:10},
      largeText: { fontSize: 18,},
      placeholder: { position: "absolute", left: '10%', top: "40%", fontSize: 18, fontWeight: 'bold', color: '#555' },
      textcrossed: { flex:1, fontWeight: 'bold', color: '#4c2b08', marginLeft: 8, marginRight: 10,textDecorationLine:'line-through'},
      fab: {position: 'absolute',bottom: '15%',right: '10%',backgroundColor:'#4c2b08',borderRadius: 50,paddingVertical: 15,paddingHorizontal: 20,elevation: 5,shadowOffset: { width: 0, height: 2 },shadowOpacity: 0.3,shadowRadius: 4,},
})