import { SafeAreaView, StyleSheet, Text, TextInput, Button, View, FlatList } from "react-native"
import { useState } from 'react';
import { supabase } from '../supabase';
import { Session } from "@supabase/supabase-js";

export default function NewPost({ session }: { session: Session }) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [files, setFiles] = useState<string[]>([]);
    const [links, setLinks] = useState<string[]>([]);

    const [addingLink, setAddingLink] = useState(false);
    const [link, setLink] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    async function createPost() {
        setLoading(true);
        try {
            const { error } = await supabase.from('posts').insert({
                user_id: session?.user.id,
                title, 
                content,
                files: links,
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

    function addLink() {
        const newLinks = [...links];
        newLinks.push(link);
        setLinks(newLinks);
        setLink('');
        setAddingLink(false);
    }

    async function addFile() {

    }

    return (<SafeAreaView style = {styles.main}>
        {error && <Text style = {styles.error}>An error occurred, please try again!</Text>}
        <Text style = {styles.title}>New Post</Text>

        <Text style = {styles.label}>Title</Text>
        <View style = {styles.textView}>
            <TextInput value = {title || ''} onChangeText = {(text) => setTitle(text)}/>
        </View>

        <Text style = {styles.label}>Text</Text>
        <View style = {styles.textView}>
            <TextInput value = {content || ''} onChangeText = {(text) => setContent(text)}
                multiline = {true}
                numberOfLines = {3}
                textAlignVertical = "top"
            />
        </View>

        {!links.length || <>
            <Text style = {styles.label}>Links</Text>
            <FlatList style = {styles.list} data = {links} renderItem = {({ index, item}) => {
                return <View style = {styles.linkView}>
                    <View style = {styles.removeButtonView}>
                        <Button title = "-" color = "red" onPress = {() => {
                            const newLinks = [...links];
                            newLinks.splice(index, 1);
                            setLinks(newLinks);
                        }}/>
                    </View>
                    <Text style = {styles.linkText} numberOfLines = {1}>{item || ''}</Text>
                </View>
            }}/>
        </>}

        {addingLink && <View style = {styles.newLinkView}>
            <View style = {styles.newRemoveButtonView}>
                <Button title = "-" onPress = {() => setAddingLink(false)} color = "red"/>
            </View>
            <View style = {styles.newLinkTextView}>
                <TextInput value = {link} onChangeText = {(text) => setLink(text)} textAlignVertical = "center"/>
            </View>
        </View>}

        <View style = {styles.buttonView}>
            <Button title = "Add Link" 
                onPress = {() => addingLink ? addLink() : setAddingLink(true)}
                disabled = {addingLink && !link.length}
            />
        </View>

        <View style = {styles.buttonView}>
            <Button title="Add File" onPress={() => addFile()}/>
        </View>

        <View style = {styles.buttonView}>
            <Button
                title = "Create"
                onPress = {() => createPost()}
                disabled = {loading || !title}
            />
        </View>

        
    </SafeAreaView>)
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: 'center'
        
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
        marginTop: '2%',
        color: 'white',
        fontSize: 30,
        textAlign: 'center'
    },
    list: {
        marginHorizontal: '10%',
        marginTop: '2%',
        flexShrink: 1,
        maxHeight: '20%',
    },
    linkView: {
        flexDirection: 'row',
        marginBottom: '3%'
    },
    linkText: {
        fontSize: 21,
        alignSelf: 'center',
        color: 'white',
        textAlign: 'left'
    },
    removeButtonView: {
        marginStart: '1%',
        marginEnd: '3%',
        alignSelf: 'center',
        width: '7%',
    },
    newLinkView: {
        marginHorizontal: '10%',
        flexDirection: 'row',
        height: '7%'
    },
    newLinkTextView: {
        padding: '1%',
        margin: '2%',
        marginBottom: '1%',
        flex: 1,
        maxHeight: '70%',
        alignSelf: 'center',
        backgroundColor: 'white',
        borderRadius: 15,
    },
    newRemoveButtonView: {
        marginTop: '2%',
        marginStart: '1%',
        marginEnd: '3%',
        flexShrink: 1,
        width: '7%',
    },
    error: {
        color: 'red',
        textAlign: 'center'
    }
})