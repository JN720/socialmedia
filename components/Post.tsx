import { View, Image, Text, StyleSheet, useWindowDimensions, Button, Linking, Alert, Pressable } from 'react-native';
import { randomUUID } from 'expo-crypto';
import { supabase } from '../supabase';
import React, { useState, useEffect } from 'react';
import { getExtension } from './NewPost';
import { ResizeMode, Video } from 'expo-av';
import { userInfo } from './Home';

type postLink = {
    uri: string;
    contentType: number | null;
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

const videoExtensions = ['mp4'];
const imageExtensions = ['jpg', 'jpeg', 'tiff', 'png', 'gif', 'bmp'];

async function getMediaType(uri: string): Promise<number> {
    const extension = getExtension(uri);
    //image
    if(imageExtensions.indexOf(extension) != -1) {
        return 1;   
    }
    //video
    if (videoExtensions.indexOf(extension) != -1) {
        return 2;
    }
    try {
        const res = await fetch(uri, {method: 'HEAD'});
        if (res.ok) {
            const contentType = res.headers.get('Content-Type');
            if (contentType && contentType.startsWith('image') && imageExtensions.indexOf(contentType.substring(6)) != -1) {
                return 1;
            }
            if (contentType && contentType.startsWith('video') && videoExtensions.indexOf(contentType.substring(6)) != -1) {
                return 2;
            }
        } else if (res.status == 405) {
            const res = await fetch(uri, {method: 'GET'});
            if (res.ok) {
                const contentType = res.headers.get('Content-Type');
                return Number(contentType && contentType.startsWith('image') && imageExtensions.indexOf(contentType.substring(6)) != -1)
            } else {
                return 0;
            }
        }
        return 0;
    } catch(e) {
        return 0;
    }
}

export function cdnify(uri: string) {
    if (uri.startsWith('cdn:')) {
        return 'https://kasmcuzswsaodmhhcwbe.supabase.co/storage/v1/object/public/uploads/' + uri.substring(4);
    }
    return uri;
}

export default function Post({ setPage, item, uid, select, mediaInfo, index }: { setPage: React.Dispatch<{page: number, user: string | null}>, item: postType, uid: string, select: CallableFunction, mediaInfo: React.MutableRefObject<(number | null)[][]>, index: number }) {
    const dims = useWindowDimensions();

    const [media, setMedia] = useState<postLink[]>(item.files.map((uri, i) => {return { uri, contentType: mediaInfo.current[index][i] }}));
    const [liked, setLiked] = useState(item.liked);

    useEffect(() => {
        for (let i = 0; i < media.length; i++) {
            const link = media[i];
            if (link.contentType == null) {
                getMediaType(link.uri).then((res) => {
                    checkMedia(i, { uri: link.uri, contentType: res });
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

    return (<View style = {styles.post}>
        <Pressable style = {styles.user} onPress= {() => setPage({page: 3, user: item.uid})}>
            <Image width = {dims.width * 0.08} 
                height = {dims.width * 0.08} style = {styles.picture} 
                source = {item.picture ? {uri: item.picture} : require('./user.png')} 
            />
            <View style = {styles.usernameView}>
                <Text style = {styles.username}>{item.name}</Text>
            </View>    
        </Pressable>
        <Pressable onPress = {() => select(item.id)}>
            <Text style = {styles.title}>{item.title}</Text>
            {item.content && <Text style = {styles.content}>{item.content}</Text>}
            {media.map(({ uri, contentType }) => {
                const sourceUri = cdnify(uri);
                switch (contentType) { 
                    case 1:
                        return <Image style = {styles.image} 
                            key = {randomUUID()} 
                            width = {dims.width * 0.7} 
                            height = {dims.width * 0.7} 
                            source = {{uri: sourceUri}} 
                            alt = {sourceUri}
                        /> 
                    case 2:
                        <Video style={styles.video}
                            source = {{uri: sourceUri}}
                            useNativeControls
                            resizeMode = {ResizeMode.CONTAIN}
                            isLooping
                        />
                    default:
                        return <Text style = {styles.link} key = {randomUUID()} onPress = {() => Linking.openURL(sourceUri)}>{sourceUri}</Text>
                }
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
        </Pressable>
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
    },
    video: {
        
    }
})