import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react'
import { StyleSheet, Text, FlatList, View } from 'react-native'

type post = {
    id: string,
    title: string,
    text: string,
    userId: string,
    username: string
    userAvatar: string,
    files: string[]
};

const samplePosts: post[] = [
    {id: '1', title: 'hi', text: 'yo wassup', userId: '1', username: 'bob the idiot', userAvatar: '', files: []},
    {id: '2', title: 'lo', text: 'i am a cool post', userId: '1', username: 'bob the idiot', userAvatar: '', files: []}
]

export default function Feed({ session }: { session: Session }) {
    const [posts, setPosts] = useState<post[]>(samplePosts)

    if (posts.length) {
        return <FlatList style = {styles.main} data = {posts} renderItem = {({ item }) => {
            return <View style = {styles.post}>
                <View style = {styles.user}>
                    <Text style = {styles.avatar}>image</Text>
                    <Text style = {styles.username}>{item.username}</Text>
                </View>
            </View>
        }}/>
    } else {
        return <View style = {styles.empty}>
            <Text style = {styles.emptyText}>No posts here!</Text>
        </View>
    }

}

const styles = StyleSheet.create({
    main: {
        marginTop: '2%',
        marginHorizontal: '5%'
    },
    post: {

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
    user: {
        flex: 1,
        flexDirection: 'row'
    },
    username: {
        color: 'white',
        fontSize: 15
    },
    avatar: {
        color: 'white'
    },
})