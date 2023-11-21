import { StyleSheet, Alert, Image, View, Text, useWindowDimensions, Button } from 'react-native';
import { useState } from 'react';
import { supabase } from '../supabase';

import { replyState } from './Comments';

export type commentType = {
    id: string; 
    content: string;  
    uid: string;
    cid: string;
    name: string;
    picture?: string;
    likes: number;
    liked: boolean;
};

export default function Comment({ item, uid, postId, depth, select }: { item: commentType, uid: string, postId: string, depth: number, select: React.Dispatch<replyState> }) {
    const dims = useWindowDimensions();
    const [liked, setLiked] = useState(item.liked);

    async function changeLiked() {
        item.liked = !item.liked;
        try {
            if (item.liked) {
                const { error } = await supabase.from('comment_likes').insert({ comment_id: item.id, user_id: uid });
                if (error) {
                    throw error;
                }
                item.likes++;
            } else {
                const { error } = await supabase.from('comment_likes').delete().eq('comment_id', item.id).eq('user_id', uid);
                if (error) {
                    throw error;
                }
                item.likes--;
            }
        } catch(e: any) {
            item.liked = !item.liked;
            Alert.alert('An error occurred');
        } finally {
            setLiked(item.liked);
        }
    }

    return <View style = {[depths[depth].depth, styles.comment]}>
        <View style = {styles.user}>
            <Image width = {dims.width * 0.08} height = {dims.width * 0.08} style = {styles.picture} source = {item.picture ? {uri: item.picture} : require('./user.png')} 
                
            />
            <View style = {styles.usernameView}>
                <Text style = {styles.username}>{item.name}</Text>
            </View>    
        </View>
        <Text style = {styles.content}>{item.content}</Text>
        <View style = {styles.actions}>
            <View style = {styles.interactView}>
                <Button color = {liked ? 'pink' : 'grey'} 
                    title = {item.likes.toString()}
                    onPress = {changeLiked}
                />
            </View>
            <View style = {styles.interactView}>
                <Button color = "darkblue" 
                    title = "Reply" 
                    onPress = {() => select({id: item.id, name: item.name})}
                />
            </View>
        </View>
    </View>
}

const depths = [
    StyleSheet.create({depth: {marginStart: '0%'}}), 
    StyleSheet.create({depth: {marginStart: '4%'}}),
    StyleSheet.create({depth: {marginStart: '8%'}}),
    StyleSheet.create({depth: {marginStart: '12%'}}),
    StyleSheet.create({depth: {marginStart: '16%'}}),
    StyleSheet.create({depth: {marginStart: '20%'}}),
];

const styles = StyleSheet.create({
    comment: {
        marginVertical: '1%',
        padding: '1%',
        backgroundColor: '#404040'
    },
    user: {
        flex: 1,
        flexDirection: 'row',
    },
    usernameView: {
        marginStart: '3%',
        flexDirection: 'column',
        justifyContent: 'center'
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
    content: {
        padding: '2%',
        color: 'white',
        fontSize: 13
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
})