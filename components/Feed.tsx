import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react'
import { StyleSheet, Text, FlatList, View, Button } from 'react-native'
import { supabase } from '../supabase';

import Post, { postType } from './Post'
import Comments from './Comments';

/*
const samplePosts: postType[] = [
    {
        id: '1', 
        title: 'hi', 
        content: 'yo wassup', 
        files: ['https://picsum.photos/800', 'https://picsum.photos/2000'], 
        uid: '1', 
        name: 'bob the idiot', 
        likes: 30, 
        liked: false
    },
    {
        id: '2', 
        title: 'lo this title is like real real real long yoehmiuxcemhgiuhemsi', 
        content: 'i am a cool post', 
        files: [], 
        uid: '1', 
        name: 'bob the idiot', 
        picture: 'https://picsum.photos/1200', 
        likes: 1, 
        liked: false
    }
]
*/

async function getPosts(uid: string): Promise<postType[]> {
    const { data, error } = await supabase.rpc('get_posts', {user_uuid: uid});
    if (error) {
        throw error;
    }
    return data;
}

export default function Feed({ session }: { session: Session }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [posts, setPosts] = useState<postType[]>([]);

    const [currentPost, setCurrentPost] = useState<string | null>(null);

    function select(id: string) {
        setCurrentPost(id);
    }

    function fetchPosts() {
        setLoading(true);
        getPosts(session?.user.id)
            .then((posts) => {
                setPosts(posts);
                setError(false);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) {
        return <Text style = {styles.loadingText}>Loading...</Text>
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
            <FlatList style = {styles.main} data = {posts} renderItem = {({ item }: { item: postType}) => {
                return (!currentPost || item.id == currentPost) ? <Post item = {item} uid = {session?.user.id} select = {select}/> : null
            }}/>
            {(!currentPost) || <Comments postId = {currentPost} uid = {session?.user.id}/>}
        </>
    } else {
        return <View style = {styles.empty}>
            <Text style = {styles.emptyText}>No posts here!</Text>
        </View>
    }

}

const styles = StyleSheet.create({
    main: {
        flex: -1,
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