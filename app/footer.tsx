import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function Footer({ uri }: { uri ?: any }){
    const router = useRouter();
    const path = uri;
    const encodedPath = encodeURIComponent(uri);
    const iconColor = '#5c322e'
  
    return(
        <View style = {styles.footer}>
                <Pressable onPress={() => {router.push('/')}} >
                    <FontAwesome name="home" size={30} color={iconColor}></FontAwesome>
                </Pressable>

                <Pressable onPress={() => {router.push(`/flashcards?path=${encodedPath}`)}}>
                    <Ionicons name="albums-outline" size={30} color={iconColor}></Ionicons>
                </Pressable>

                 <Pressable onPress={() => {router.push('/dailytasks')}}>
                    <FontAwesome5 name="clipboard-list" size={30} color={iconColor}></FontAwesome5>
                </Pressable>
        </View>
        
 )
}
 const styles = StyleSheet.create({
    footer :{
        flexDirection : 'row',
        justifyContent: 'space-evenly',
        padding:10,
        paddingBottom:20,
        borderTopColor:'#4c2b08',
        borderTopWidth:1,
        backgroundColor:'#deceac',
    }
 })