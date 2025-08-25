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
     // console.log(data);
      data.push([value,category]);
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
    return  data.map((item,index)=>(
            item[1] == category ?(
            <View key={index} style={styles.itemRow}>
                  <Text style={styles.text}>
                    {item[0]}
                  </Text>
                   <Pressable style={styles.button} onPress={() =>deleteItem(index)}>
                        <FontAwesome5 name='trash' size={24} color="#e57373" />
                  </Pressable>
            </View>):null
        ))
  }

  const renderTitle= ()=>{
    if(category=='1')return <Text style={styles.title}>Daily Tasks</Text>
    else if(category=='2')return <Text style={styles.title}>Weekly Tasks</Text>
    else if(category=='3')return  <Text style={styles.title}>Projects</Text> 
  }

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
      {renderTitle()}
      <View style={styles.inputRow}>
        <TextInput placeholder='Add something to remember...' value={inputText} onChangeText={setInputText} style={styles.input}/>
        <Pressable style={styles.pressableAdd} onPress={handleInput}>
           <Text style={styles.pressableText}>Add</Text>
        </Pressable>
      </View>

      <View style={styles.inputRow}>
        <Pressable style={styles.pressable} onPress={() => setCategory('1')}>
           <Text style={styles.pressableText}>Daily</Text>
        </Pressable>
        <Pressable style={styles.pressable} onPress={() => setCategory('2')}>
           <Text style={styles.pressableText}>Weekly</Text>
        </Pressable>
        <Pressable style={styles.pressable} onPress={() => setCategory('3')}>
           <Text style={styles.pressableText}>Projects</Text>
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
      title: { fontSize: 25, fontWeight: 'bold', marginBottom: 20, marginLeft: '5%', marginTop: '5%', color: '#555',textAlign:"center" },
      inputRow: {flexDirection: 'row',alignItems: 'center',marginBottom: 20,gap: 10,justifyContent:'space-around',},
      input: {flex: 1,borderWidth: 2,borderColor: '#ccc',borderRadius: 15,padding: 10,backgroundColor: '#fff',height:'110%'},
      scroll: {flex: 1,},
      itemRow: {flexDirection: 'row',alignItems: 'center',width:'100%',padding: 10,marginVertical: 5,backgroundColor: '#f0f0f0',borderRadius: 20,borderColor:'#ccc',borderWidth:2,},
      button: { padding: 5, borderRadius: 20},
      pressable:{backgroundColor:'#3b88b8',padding: 5, borderRadius: 20 },
      pressableAdd:{backgroundColor:'#75c197',padding: 5, borderRadius: 20 },
      pressableText:{color:'#fff', fontSize: 17, fontWeight: 'bold',paddingHorizontal:10,paddingVertical:5},
      text: { flex:1, fontSize: 17, fontWeight: 'bold', color: '#555', marginLeft: 8, marginRight: 10 },
})