import { TouchableOpacity, View, Text, Image, StyleSheet, useWindowDimensions, Alert, Button } from "react-native";
import { useState } from "react";
import { supabase } from "../supabase";


export type personType = {
    id: string;
    name: string;
    bio: string;
    picture: string;
    followers: number;
    isfollower: boolean;
    isfollowing: boolean;
}

export default function Person({ item, uid, select }: { item: personType, uid: string, select: React.Dispatch<string | null> }) {
    const dims = useWindowDimensions();

    const [following, setFollowing] = useState(item.isfollowing)

    async function changeFollowing() {
        item.isfollowing = !item.isfollowing;
        try {
            if (item.isfollowing) {
                const { error } = await supabase.from('follows').insert( { to_user: item.id, from_user: uid } )
                if (error) {
                    console.log(error)
                    throw error;
                }
                item.followers++;
            } else {
                const { error } = await supabase.from('follows').delete().eq('to_user', item.id).eq('from_user', uid);
                if (error) {
                    throw error;
                }
                item.followers--;
            }
        } catch(e: any) {
            item.isfollowing = !item.isfollowing;
            Alert.alert('An error occurred');
        } finally {
            setFollowing(item.isfollowing);
        }
    }

    return <TouchableOpacity style = {styles.person} onPress = {() => select(item.id)}>
        <View style = {styles.user}>
            <Image width = {dims.width * 0.08} 
                height = {dims.width * 0.08} style = {styles.picture} 
                source = {item.picture ? {uri: item.picture} : require('./user.png')} 
            />
            <View style = {styles.usernameView}>
                <Text style = {styles.username}>{item.name}</Text>
            </View>    
        </View>
        <Text style = {styles.bio}>{item.bio}</Text>
        <View style = {styles.actions}>
            <View style = {styles.interactView}>
                <Button color = {following ? 'darkblue' : 'grey'} 
                    title = {item.followers.toString()}
                    onPress = {changeFollowing}
                />
            </View>
            {item.isfollower && <Text style = {styles.followText}>{item.name} follows you</Text>}
        </View>
    </TouchableOpacity>
}

const styles = StyleSheet.create({
    person: {
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
    picture: {
        width: '8%',
        height: 'auto',
        borderRadius: 1000
    },
    bio: {
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
        flexDirection: 'row-reverse',
        marginHorizontal: '1%',
        marginVertical: '2%',
        flexShrink: 1
    },
    interactView: {
        marginHorizontal: '2%'
    },
    followText: {
        alignSelf: 'center',
        color: 'lightblue',
        fontSize: 20
        
    }
})