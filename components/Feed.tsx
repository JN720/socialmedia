import { useState, useEffect, useReducer, useRef } from 'react'
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native'
import { supabase } from '../supabase';

import Post, { postType } from './Post'
import Comments from './Comments';
import NewComment from './NewComment';
import { userInfo } from './Home';
import { randomUUID } from 'expo-crypto';
import { indentedComment, replyState } from './Comments';

async function getPosts(uid: string, id: string | null): Promise<postType[]> {
    const { data, error } = await supabase.rpc('get_posts', {user_uuid: uid}).returns<postType[]>();
    if (error) {
        throw error;
    }
    return data;
}

export function setReply(state: replyState, action: replyState): replyState {
    return action;
}

function setComments(state: indentedComment[], action: indentedComment[]) {
    return action;
}

export default function Feed({ user, uid }: { user: userInfo, uid: string | null }) {
    const [loading, setLoading] = useState(0);
    const [error, setError] = useState(false);
    const [posts, setPosts] = useState<postType[]>([]);

    const [currentPost, setCurrentPost] = useState<string | null>(null);
    const [comments, dispatchComments] = useReducer(setComments, []);
    const [reply, dispatchReply] = useReducer(setReply, {id: null, name: null});

    const media = useRef<(boolean | null)[][]>([])

    function select(id: string) {
        setCurrentPost(id);
    }

    function fetchPosts() {
        getPosts(user.id, uid)
            .then((posts) => {
                setPosts(posts);
                posts.forEach((post, index) => {
                    media.current.push(post.files.map(() => null))
                })
                setError(false);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(0));
    }

    async function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
        if (loading == 0 && e.nativeEvent.contentOffset.y <= 5 && e.nativeEvent.velocity?.y && e.nativeEvent.velocity.y < -0.9) {
            setLoading(2);
            setTimeout(fetchPosts, 500);
        }

    }

    useEffect(() => {
        setLoading(1);
        fetchPosts();
    }, []);

    if (loading == 1) {
        return <ActivityIndicator color = "dodgerblue" size = "large"/>
    }
    if (error) {
        return <>
            <Text style = {styles.errorText}>Uh oh we couldn't find posts D:</Text>
            <Button title = "Retry" 
                onPress = {() => fetchPosts()} 
                color = "red"
            />
        </>
    }
    if (posts.length) {
        return <>
            {(loading < 2 || !!currentPost) || <ActivityIndicator style = {styles.feedSpinner} color = "dodgerblue" size = "large"/>}
            {!currentPost || <View style = {styles.backButton}>
                <Button title = "back" color = "red" onPress = {() => setCurrentPost(null)}/>
                {loading < 2 || <ActivityIndicator style = {styles.commentSpinner} color = "dodgerblue" size = "large"/>}
            </View>}
            <ScrollView style = {styles.main} onScroll = {handleScroll}>
                {posts.map((item: postType, index) => {
                    return (!currentPost || item.id == currentPost) ? <Post item = {item} uid = {user.id} select = {select} key = {randomUUID()} mediaInfo = {media} index = {index}/> : null
                })}
                {(!currentPost) || <Comments comments = {comments} setComments = {dispatchComments} postId = {currentPost} user = {user} setReply = {dispatchReply}/>}
            </ScrollView>
            {!currentPost || <NewComment comments = {comments} setComments = {dispatchComments} postId = {currentPost} user = {user} reply = {reply} setReply = {dispatchReply}/>}
        </>
    } else {
        return <View style = {styles.empty}>
            <Text style = {styles.emptyText}>No posts here!</Text>
        </View>
    }

}

const styles = StyleSheet.create({
    main: {
        flexShrink: 1,
        marginTop: '1%',
        marginBottom: '4%',
        marginHorizontal: '5%'
    },
    empty: {
        marginTop: '25%',
        marginHorizontal: '15%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: 'white',
        fontSize: 60,
        textAlign: 'center'
    },
    loadingText: {
        color: 'white',
        fontSize: 60,
        textAlign: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 60,
        textAlign: 'center'
    },
    backButton: {
        marginTop: '2%',
        marginStart: '2%',
        flexDirection: 'row',
        width: '20%'
    },
    feedSpinner: {
        marginTop: '2%'
    },
    commentSpinner: {
        marginStart: '6%',
        alignSelf: 'center'
    }
})