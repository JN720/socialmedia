import { StyleSheet, FlatList, Text, Button, View, TextInput, SafeAreaView, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect, useReducer, ReducerState } from 'react';
import { supabase } from '../supabase';
import { randomUUID } from 'expo-crypto';

import Comment, { commentType } from './Comment'
import { userInfo } from './Home';

export type replyState = {
    id: string | null;
    name: string | null;
}

export type indentedComment = {
    comment: commentType;
    depth: number;
}

async function getComments(uid: string, postId: string): Promise<commentType[]> {
    const { data, error } = await supabase.rpc('get_comments', {user_uuid: uid, cur_post_id: postId});
    if (error) {
        throw error;
    }
    return data;
}

function treeify(unsorted: commentType[]): indentedComment[] {
    let sorted: indentedComment[] = [];
    for (const comment of unsorted) {
        if (!comment.cid) {
            sorted.push({comment, depth: 0});
        }
    }
    for (let depth = 1; depth < 4; depth++) {
        for (const comment of unsorted) {
            const [d, i] = findComment(comment.cid, sorted);
            if (i != -1 && findComment(comment.id, sorted)[1] == -1) {
                sorted.splice(i + 1, 0, {comment, depth: d + 1});
            }
        }
    }
    return sorted;
}

export function findComment(cid: string, arr: indentedComment[]) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].comment.id == cid) {
            return [arr[i].depth, i];
        }
    }
    return [0, -1];
}

export default function Comments({ user, postId, comments, setComments, setReply }: { user: userInfo, postId: string, comments: indentedComment[], setComments: React.Dispatch<indentedComment[]>, setReply: React.Dispatch<replyState> }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    function fetchComments() {
        setLoading(true);
        getComments(user.id, postId)
            .then((unsortedComments) => {
                setComments(treeify(unsortedComments));
                setError(false);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }

    useEffect(() => {
        fetchComments();
    }, [])

    if (loading) {
        return <ActivityIndicator color = "dodgerblue" size = "small"/>
    }

    if (error) {
        return <>
            <Text style = {styles.errorText}>Failed to Get Comments</Text>
            <Button title = "Retry" 
                onPress = {() => fetchComments()} 
                color = "red"
            />
        </>
    }

    return <>
        {comments.length ? <View style = {styles.main}>

            {comments.map((item) => 
            <Comment uid = {user.id}
                postId = {postId}
                depth = {item.depth}
                select = {setReply} 
                item = {item.comment}
                key = {randomUUID()}
            />)}
        </View> :
        <View style = {styles.empty}>
            <Text style = {styles.emptyText}>Be the first to comment</Text>
        </View>
        }
        
    </>
}





const styles = StyleSheet.create({
    main: {
       marginHorizontal: '5%'
    },
    empty: {
        marginTop: '5%',
        marginHorizontal: '15%',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    emptyText: {
        color: 'white',
        fontSize: 30,
        textAlign: 'center'
    },
    loadingText: {
        color: 'white',
        fontSize: 60,
        textAlign: 'center'
    },
    errorText: {
        marginBottom: '5%',
        color: 'red',
        fontSize: 30,
        textAlign: 'center'
    }
})