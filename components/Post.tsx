import { View, Image, Text, StyleSheet, useWindowDimensions, Button, Linking, Alert, TouchableOpacity } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { supabase } from '../supabase';
import { useState, useEffect } from 'react';

type postLink = {
    uri: string;
    isImage: boolean | null;
}

export type postType = {
    id: string; 
    title: string; 
    content: string; 
    files: string[];
    uid: string;
    name: string;
    picture?: string;
    likes: number;
    liked: boolean;
};

const imageTypes = ['image/jpg', 'image/jpeg', 'image/tiff', 'image/png', 'image/gif', 'image/bmp'];

async function isImage(uri: string): Promise<boolean> {
    uri = uri.split('?')[0];
    const parts = uri.split('.');
    if(imageTypes.indexOf(parts[parts.length - 1]) != -1) {
        return true;   
    }
    try {
        const res = await fetch(uri, {method: 'HEAD'});
        if (res.ok) {
            const contentType = res.headers.get('Content-Type');
            return Boolean (contentType && contentType.startsWith('image') && imageTypes.indexOf(contentType) != -1)
        } else if (res.status == 405) {
            const res = await fetch(uri, {method: 'GET'});
            if (res.ok) {
                const contentType = res.headers.get('Content-Type');
                return Boolean(contentType && contentType.startsWith('image') && imageTypes.indexOf(contentType) != -1)
            } else {
                return false;
            }
        }
        return false;
    } catch(e) {
        return false;
    }
}

export default function Post({ item, uid, select, mediaInfo, index }: { item: postType, uid: string, select: CallableFunction, mediaInfo: React.MutableRefObject<(boolean | null)[][]>, index: number }) {
    const dims = useWindowDimensions();

    const [media, setMedia] = useState<postLink[]>(item.files.map((uri, i) => {return { uri, isImage: mediaInfo.current[index][i] }}));
    const [liked, setLiked] = useState(item.liked);

    useEffect(() => {
        for (let i = 0; i < media.length; i++) {
            const link = media[i];
            if (!link.isImage) {
                isImage(link.uri).then((res) => {
                    checkMedia(i, { uri: link.uri, isImage: res });
                    mediaInfo.current[index][i] = res;
                })
            }
        }
    }, []);

    function checkMedia(i: number, link: postLink) {
        const newMedia = [...media];
        newMedia[i] = link;
        setMedia(newMedia);
    }

    async function changeLiked() {
        item.liked = !item.liked;
        try {
            if (item.liked) {
                const { error } = await supabase.from('post_likes').insert( { post_id: item.id, user_id: uid } )
                if (error) {
                    throw error;
                }
                item.likes++;
            } else {
                const { error } = await supabase.from('post_likes').delete().eq('post_id', item.id).eq('user_id', uid);
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

    return (<TouchableOpacity style = {styles.post} onPress = {() => select(item.id)}>
        <View style = {styles.user}>
            <Image width = {dims.width * 0.08} 
                height = {dims.width * 0.08} style = {styles.picture} 
                source = {item.picture ? {uri: item.picture} : require('./user.png')} 
            />
            <View style = {styles.usernameView}>
                <Text style = {styles.username}>{item.name}</Text>
            </View>    
        </View>
        <Text style = {styles.title}>{item.title}</Text>
        {item.content && <Text style = {styles.content}>{item.content}</Text>}
        {media.map(({ uri, isImage }) => {
            return isImage ? <Image style = {styles.image} 
                key = {randomUUID()} 
                width = {dims.width * 0.7} 
                height = {dims.width * 0.7} 
                source = {{uri: uri}} 
                alt = {uri}
            /> :
            <Text style = {styles.link} key = {randomUUID()} onPress = {() => Linking.openURL(uri)}>{uri}</Text>
        })}
        <View style = {styles.actions}>
            <View style = {styles.interactView}>
                <Button color = {liked ? 'pink' : 'grey'} 
                    title = {item.likes.toString()}
                    onPress = {changeLiked}
                />
            </View>
            <View style = {styles.interactView}>
                <Button color = "green" title = "Save"/>
            </View>
        </View>
    </TouchableOpacity>)
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
        flexDirection: 'row-reverse',
        marginHorizontal: '1%',
        marginVertical: '2%',
        flexShrink: 1
    },
    interactView: {
        marginHorizontal: '2%'
    },
    link: {
        marginStart: '2%',
        marginVertical: '1%',
        color: 'lightblue',
        fontSize: 12
    }
})