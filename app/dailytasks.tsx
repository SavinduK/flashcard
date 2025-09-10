import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from './footer';


export default function Index() {

  const [inputText,setInputText] = useState('');//saves and updates the text in textbox
  
  const [data,setData] = useState<any[]>([]);
  const KEY = 'dbKey';

  const router = useRouter()
  const [category,setCategory] = useState('1')

  //refresh list
  useEffect(() => {
      reloadItems();
      }, []);
 
  //save to async storage
  const storeData = async (value: any) => {
  try {
    const jsonValue = await AsyncStorage.getItem(KEY);
    if(jsonValue != null){
      let data = JSON.parse(jsonValue);
      data.push([value,category,0]);//0=incomplete -1= late 1=complete
      setData(data);
      try {
        await AsyncStorage.setItem(KEY, JSON.stringify(data));
      } catch (e) {
           console.error('Failed to save data', e);
         }
    }else{
      let data = [];
      data.push([value,category])
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
      setInputText('')
      if (inputText != ''){
        storeData(inputText)
      }else{
        reloadItems()
      }
      
  }

  const toggleComplete = async(index:number)=>{
    let newArray = [...data];
    newArray[index] = [...newArray[index]]; // clone item
    newArray[index][2] = newArray[index][2] === 0 ? 1 : 0;

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
      Alert.alert(
        "Delete Confirmation",
        "Are you sure you want to delete this item?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              handleDelete(index)
            },
          },
        ],
        { cancelable: true }
      );
    };
  //reload items
  const reloadItems = async() =>{
    try {
    const jsonValue = await AsyncStorage.getItem(KEY);
    if(jsonValue != null){
      let data = JSON.parse(jsonValue);
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
    return data.sort((a, b) => a[2] - b[2]).map((item,index)=>
      (item[1] == category ?(
      <View key={index} style={styles.itemRow}> 
        <Pressable style={styles.button} onPress={() =>toggleComplete(index)}> 
          <FontAwesome5 name={item[2]==0?'square':item[2]==1?'check':null} size={24} color="#75c197" />
        </Pressable> 
        <Text style={item[2]==0?styles.text:item[2]==1?styles.textcrossed:null}> {item[0]} </Text> 
        <Pressable style={styles.button} onPress={() =>deleteItem(index)}> 
          <FontAwesome5 name='trash' size={24} color="#e57373" /> 
        </Pressable>
      </View>):null )) }

  useEffect(() => {
      renderItems();
    }, [renderItems]);
  
    useFocusEffect(
      useCallback(() => {
        renderItems();
      }, [renderItems])
    );

  //view components
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flexDirection:'row',alignItems:'center'}}>
        <FontAwesome5 name="clipboard-list" size={30} color='#555'></FontAwesome5>
        <Text style={styles.title}>My Tasks</Text>
      </View> 
      <View style={styles.inputRow}>
        <TextInput placeholder='Add something to remember...' value={inputText} onChangeText={setInputText} style={styles.input}/>
        <Pressable style={styles.pressableAdd} onPress={handleInput}>
           <Text style={styles.pressableTextSelected}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
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
      <Footer/> 
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({    
      container: {flex: 1, padding: 20, backgroundColor: '#f0f0f0'},
      title: { fontSize: 25, fontWeight: 'bold', marginBottom: 20, marginLeft: '5%', marginTop: '5%', color: '#555',},
      inputRow: {flexDirection: 'row',alignItems: 'center',marginBottom: 20,gap: 10,justifyContent:'space-around',},
      input: {flex: 1,borderWidth: 2,borderColor: '#ccc',borderRadius: 15,padding: 10,backgroundColor: '#fff',height:'110%'},
      scroll: {flex: 1,},
      itemRow: {flexDirection: 'row',alignItems: 'center',width:'100%',padding: 10,marginVertical: 5,backgroundColor: '#f0f0f0',borderRadius: 20,borderColor:'#ccc',borderWidth:2,},
      button: { padding: 5, borderRadius: 20},
      pressable:{backgroundColor:'#f0f0f0',padding: 5, borderRadius: 20 },
      pressableSelected:{backgroundColor:'#3b88b8',padding: 5, borderRadius: 20 },
      pressableAdd:{backgroundColor:'#75c197',padding: 5, borderRadius: 20 },
      pressableText:{color:'#555', fontSize: 17, fontWeight: 'bold',paddingHorizontal:10,paddingVertical:5},
      pressableTextSelected:{color:'#fff', fontSize: 17, fontWeight: 'bold',paddingHorizontal:10,paddingVertical:5},
      text: { flex:1, fontSize: 17, fontWeight: 'bold', color: '#555', marginLeft: 8, marginRight: 10 },
      textcrossed: { flex:1, fontSize: 17, fontWeight: 'bold', color: '#555', marginLeft: 8, marginRight: 10,textDecorationLine:'line-through' },
})