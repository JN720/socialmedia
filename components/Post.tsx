import { post } from "./Feed";
import { View, Image, Text, StyleSheet, useWindowDimensions, Button } from 'react-native';
import { randomUUID } from 'expo-crypto';

export default function Post({ item }: { item: post }) {
    const dims = useWindowDimensions();

    return (<View style = {styles.post}>
        <View style = {styles.user}>
            <Image width = {dims.width * 0.08} height = {dims.width * 0.08} style = {styles.avatar} source = {item.userAvatar ? {uri: item.userAvatar} : require('./user.png')} 
                
            />
            <View style = {styles.usernameView}>
                <Text style = {styles.username}>{item.username}</Text>
            </View>    
        </View>
        <Text style = {styles.title}>{item.title}</Text>
        <Text style = {styles.content}>{item.text}</Text>
        {item.files.map((uri) => {
            return <Image style = {styles.image} key = {randomUUID()} width = {dims.width * 0.7} height = {dims.width * 0.7} source = {{uri: uri}}/>
        })}
        <View style = {styles.actions}>
            <View style = {styles.interactView}>
                <Button color = "pink" title = "Like"/>
            </View>
            <View style = {styles.interactView}>
                <Button color = "red" title = "Dislike"/>
            </View>
            <View style = {styles.interactView}>
                <Button color = "darkblue" title = "Follow"/>
            </View>
            <View style = {styles.interactView}>
                <Button color = "green" title = "Save"/>
            </View>
        </View>
    </View>)
}

const styles = StyleSheet.create({
    post: {
        marginVertical: '4%',
        padding: '3%',
        backgroundColor: '#404040'
    },
    user: {
        flex: 1,
        flexDirection: 'row',
    },
    username: {
        color: 'white',
        fontSize: 15,
        justifyContent: 'center'
    },
    avatar: {
        width: '8%',
        height: 'auto',
        borderRadius: 1000
    },
    content: {
        padding: '2%',
        color: 'white',
        fontSize: 13
    },
    title: {
        flex: 4,
        padding: '2%',
        color: 'white',
        fontSize: 20
    },
    usernameView: {
        marginStart: '3%',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    image: {
        marginVertical: '2%',
        alignSelf: 'center'
    },
    actions: {
        flexDirection: 'row',
        marginHorizontal: '7%',
        marginVertical: '2%',
        flexShrink: 1
    },
    interactView: {
        marginHorizontal: '2%'
    }
})