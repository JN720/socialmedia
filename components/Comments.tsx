import { StyleSheet, FlatList, Text, Button, View, TextInput, SafeAreaView, Alert } from 'react-native';
import { useState, useEffect, useReducer } from 'react';
import { supabase } from '../supabase';

import Comment, { commentType } from './Comment'

export type replyState = {
    id: string | null;
    name: string | null;
}

type indentedComment = {
    comment: commentType;
    depth: number;
}

function reducer(state: replyState, action: replyState): replyState {
    return action;
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

function findComment(cid: string, arr: indentedComment[]) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].comment.id == cid) {
            return [arr[i].depth, i];
        }
    }
    return [0, -1];
}

export default function Comments({ uid, postId }: { uid: string, postId: string }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [comments, setComments] = useState<indentedComment[]>([]);

    const [newComment, setNewComment] = useState('');
    const [reply, dispatch] = useReducer(reducer, {id: null, name: null});

    async function postComment() {
        const { error } = await supabase.from('comments').insert({
            user_id: uid, 
            post_id: postId, 
            comment_id: reply.id,
            content: newComment
        });
        if (error) {
            Alert.alert('An error occurred');
        } else {
            setNewComment('');
        }
    }

    function fetchComments() {
        setLoading(true);
        getComments(uid, postId)
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
        return <Text style = {styles.loadingText}>Loading...</Text>
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

    return <SafeAreaView>
        {comments.length ? <FlatList style = {styles.main} 
            data = {comments} 
            renderItem = {({ item }) => 
            <Comment uid = {uid}
                postId = {postId}
                depth = {item.depth}
                reply = {reply.id} 
                select = {dispatch} 
                item = {item.comment}
            />}
        /> :
        <View style = {styles.empty}>
            <Text style = {styles.emptyText}>Be the first to comment</Text>
        </View>
        }
        <Text style = {styles.replyText}>{reply.id && `Replying to ${reply.name}`}</Text>
        <View style = {styles.newCommentView}>
            <View style = {styles.newCommentTextView}>
                <TextInput value = {newComment} onChangeText = {(text) => {setNewComment(text)}}/>
            </View>
            <View style = {styles.newCommentButtonView}>
                <Button title = "Submit" onPress = {postComment}/>
            </View>
        </View>
    </SafeAreaView>
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
    },
    newCommentView: {
        marginHorizontal: '2%',
        flexDirection: 'row',
    },
    newCommentTextView: {
        margin: '2%',
        padding: '1%',
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 15,
        alignSelf: 'center'
    },
    newCommentButtonView: {
        alignSelf: 'center'
    },
    replyText: {
        marginHorizontal: '4%',
        //textAlign: 'center',
        color: 'white'
    }
})