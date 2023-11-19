import { SafeAreaView, StyleSheet, Text, TextInput, Button, View, Alert } from "react-native"
import { useState } from 'react';
import { supabase } from '../supabase';
import { Session, PostgrestError } from "@supabase/supabase-js";

export default function NewPost({ session }: { session: Session }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    async function createPost() {
        setLoading(true);
        try {
            const { error } = await supabase.from('posts').insert({
                user_id: session?.user.id,
                title, 
                content,
                files,
                public: true
            });
            if (error) {
                throw error;
            }
        } catch(error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    return (<SafeAreaView style = {styles.main}>
        <Text style = {styles.title}>New Post</Text>

        <Text style = {styles.label}>Title</Text>
        <View style = {styles.textView}>
            <TextInput value = {title || ''} onChangeText = {(text) => setTitle(text)}/>
        </View>

        <Text style = {styles.label}>Text</Text>
        <View style = {styles.textView}>
            <TextInput value = {content || ''} onChangeText = {(text) => setContent(text)}
                multiline = {true}
                numberOfLines = {4}
                textAlignVertical = "top"
            />
        </View>

        <View style = {styles.buttonView}>
            <Button
                title = "Create"
                onPress = {() => createPost()}
                disabled = {loading || !title}
            />
        </View>

<View style = {styles.buttonView}>
    <Button title="Sign Out" onPress={() => supabase.auth.signOut()}/>
</View>
    </SafeAreaView>)
}

const styles = StyleSheet.create({
    main: {
        justifyContent: 'center',
    },
    buttonView: {
        margin: '4%',
        backgroundColor: 'white',
        width: '50%',
        borderRadius: 15,
        alignSelf: 'center'
    },
    textView: {
        marginBottom: '5%',
        padding: '2%',
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 15,
        alignSelf: 'center'
    },
    label: {
        marginStart: '10%',
        marginBottom: '2%',
        color: 'white',
        fontSize: 23,
    },
    title: {
        marginHorizontal: '5%',
        marginVertical: '7%',
        color: 'white',
        fontSize: 30,
        textAlign: 'center'
    },
    email: {
        marginStart: '10%',
        marginBottom: '2%',
        color: 'white',
        fontSize: 20
    }
})