import { Session } from '@supabase/supabase-js';
import { useState, useEffect } from 'react'
import { StyleSheet, Text, FlatList, View, Image, useWindowDimensions } from 'react-native'

import Post from './Post'

export type post = {
    id: string,
    title: string,
    text: string,
    userId: string,
    username: string
    userAvatar?: string,
    files: string[]
};

const samplePosts: post[] = [
    {id: '1', title: 'hi', text: 'yo wassup', userId: '1', username: 'bob the idiot', files: ['https://picsum.photos/800', 'https://picsum.photos/2000']},
    {id: '2', title: 'lo this title is like real real real long yoehmiuxcemhgiuhemsi', text: 'i am a cool post', userId: '1', username: 'bob the idiot', userAvatar: 'https://picsum.photos/1200', files: []}
]

export default function Feed({ session }: { session: Session }) {
    const dims = useWindowDimensions()

    const [posts, setPosts] = useState<post[]>(samplePosts)

    if (posts.length) {
        return <FlatList style = {styles.main} data = {posts} renderItem = {({ item }) => {
            return <Post item = {item}/>
        }}/>
    } else {
        return <View style = {styles.empty}>
            <Text style = {styles.emptyText}>No posts here!</Text>
        </View>
    }

}

const styles = StyleSheet.create({
    main: {
        flex: 1,
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
})