import { View, Alert, StyleSheet, Text, TextInput, Button } from 'react-native';
import { useState, useReducer } from 'react';
import { supabase } from '../supabase';

import { findComment, indentedComment, replyState } from './Comments';
import { userInfo } from './Home';

export default function NewComment({ user, postId, comments, setComments, reply, setReply }: { user: userInfo, postId: string, comments: indentedComment[], setComments: React.Dispatch<indentedComment[]>, reply: replyState, setReply: React.Dispatch<replyState> }) {
    const [newComment, setNewComment] = useState('');

    async function postComment() {
        const { data, error } = await supabase.from('comments').insert({
            user_id: user.id, 
            post_id: postId, 
            comment_id: reply.id,
            content: newComment
        }).select('id').returns<string>();
        if (error) {
            Alert.alert('An error occurred');
        } else {
            if (reply.id) {
                const [i, d] = findComment(reply.id, comments);
                let newComments = [...comments];
                const addedComment = {
                    comment: {
                        id: data,
                        uid: user.id,
                        cid: reply.id,
                        name: user.name,
                        picture: user.picture,
                        content: newComment,
                        likes: 0,
                        liked: false,
                    }, 
                    depth: findComment(reply.id, newComments)[0] + 1
                }
                newComments.splice(i + 1, 0, addedComment);
                setComments(newComments);
            } else {
                const newComments = [{
                    comment: {
                        id: data,
                        uid: user.id,
                        cid: '',
                        name: user.name,
                        picture: user.picture,
                        content: newComment,
                        likes: 0,
                        liked: false,
                    }, 
                    depth: 0
                }, ...comments]
                setComments(newComments);
            }
            
            setNewComment('');
            setReply({id: null, name: null})
        }
    }
    return <View style = {styles.newComment}>
        <Text style = {styles.replyText}>{reply.id && `Replying to ${reply.name}`}</Text>
        <View style = {styles.newCommentView}>
            <View style = {styles.newCommentTextView}>
                <TextInput value = {newComment} onChangeText = {(text) => {setNewComment(text)}}/>
            </View>
            <View style = {styles.newCommentButtonView}>
                <Button title = "Submit" onPress = {postComment}/>
            </View>
        </View>
    </View>
}

const styles = StyleSheet.create({
    newComment: {
        width: '100%',
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
        color: 'white'
    }
})