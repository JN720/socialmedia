import { useState, useEffect, useReducer, useRef } from 'react'
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView } from 'react-native'
import { supabase } from '../supabase';

import Post, { postType } from './Post'
import Comments from './Comments';
import NewComment from './NewComment';
import { userInfo } from './Home';
import { randomUUID } from 'expo-crypto';
import { indentedComment, replyState } from './Comments';

async function getPosts(uid: string): Promise<postType[]> {
    const { data, error } = await supabase.rpc('get_posts', {user_uuid: uid});
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

export default function Feed({ user }: { user: userInfo }) {
    const [loading, setLoading] = useState(false);
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
        setLoading(true);
        getPosts(user.id)
            .then((posts) => {
                setPosts(posts);
                posts.forEach((post, index) => {
                    media.current.push(post.files.map(() => null))
                })
                setError(false);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
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
            <ScrollView style = {styles.main}>
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
        marginTop: '2%',
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
    }
})