import { SafeAreaView, StyleSheet, Text, TextInput, Button, View, FlatList, Image, useWindowDimensions } from "react-native"
import { useState } from 'react';
import { supabase } from '../supabase';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker'
import { randomUUID } from "expo-crypto";

export type media = {
    uri: string;
    local: boolean;
    contentType?: string;
    index?: number;
}

export function getExtension(uri: string) {
    uri = uri.split('?')[0];
    const parts = uri.split('.');
    return parts[parts.length - 1];
}

export default function NewPost({ page, uid }: { page: number, uid: string }) {
    const { width } = useWindowDimensions();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [links, setLinks] = useState<media[]>([]);

    const [addingLink, setAddingLink] = useState(false);
    const [link, setLink] = useState('');
    const [addingFile, setAddingFile] = useState(false);
    const [uploading, setUploading] = useState(0);
    const [amountToUpload, setAmountToUpload] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    async function createPost() {
        setLoading(true);
        let uploads = links;
        const filesToUpload: media[] = [];
        uploads.forEach((file, index) => {
            if (file.local == true) {
                filesToUpload.push({uri: file.uri, contentType: file.contentType, local: true, index: index});
            }
        });
        if (filesToUpload.length) {
            try {
                setUploading(0);
                setAmountToUpload(filesToUpload.length);
                let uploaded = 0;
                for (let i = 0; i < filesToUpload.length; i++) {
                    console.log(filesToUpload[i]);
                    const { uri, contentType, index} = filesToUpload[i];
                    if (!contentType || index == null || undefined) {
                        throw new Error('Insufficient Data');
                    }
                    const file = await fetch(uri).then(res => res.arrayBuffer())
                    const extension = getExtension(filesToUpload[i].uri);
                    const filename = randomUUID() + '.' + extension;
                    const { error } = await supabase.storage.
                        from('uploads')
                        .upload(uid + '/' + filename, file, { contentType: contentType + '/' + extension});       
                    if (error) {
                        throw error;
                    }
                    uploads[index].uri = 'cdn:' + uid + '/' + filename;
                    uploaded++;
                    setUploading(uploaded);
                }
            } catch(e) {
                console.log(e);
                setUploading(0);
                setLoading(false);
                setError(true);
                return;
            }
            setUploading(0);
            setLoading(false);
        }
        console.log(uploads)
        try {
            const { error } = await supabase.from('posts').insert({
                user_id: uid,
                title, 
                content,
                files: uploads.map(({ uri }) => uri),
                public: true
            });
            if (error) {
                throw error;
            }
            setTitle('');
            setContent('');
            setLinks([]);
            setAddingLink(false);
            setLink('');
        } catch(error) {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    function addLink() {
        const newLinks = [...links];
        newLinks.push({uri: link, local: false});
        setLinks(newLinks);
        setLink('');
        setAddingLink(false);
    }

    async function addFile() {
        setAddingFile(true);
        const images = await launchImageLibraryAsync({
            mediaTypes: MediaTypeOptions.All,
            quality: 1,
            allowsMultipleSelection: true,
            orderedSelection: true,
            selectionLimit: 10 - links.length
        });
        if (!images.canceled) {
            const newLinks = links;
            newLinks.push(...images.assets.map((file) => {
                return {uri: file.uri, local: true, contentType: file.type}}));
            setLinks(newLinks);
        }
        setAddingFile(false);
    }

    if (page != 2) {
        return;
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
            <Text style = {styles.label}>Media</Text>
            <FlatList style = {styles.list} data = {links} renderItem = {({ index, item}) => {
                if (item.local) {
                    return <View style = {styles.linkView}>
                        <View style = {styles.removeButtonView}>
                            <Button title = "-" color = "red" onPress = {() => {
                                const newLinks = [...links];
                                newLinks.splice(index, 1);
                                setLinks(newLinks);
                            }}/>
                        </View>
                        <Image style = {styles.image} 
                            source = {{uri: item.uri}} 
                            width = {width * 0.2}
                            height = {width * 0.2}
                        />
                    </View>
                }
                return <View style = {styles.linkView}>
                    <View style = {styles.removeButtonView}>
                        <Button title = "-" color = "red" onPress = {() => {
                            const newLinks = [...links];
                            newLinks.splice(index, 1);
                            setLinks(newLinks);
                        }}/>
                    </View>
                    <Text style = {styles.linkText} numberOfLines = {1}>{item.uri || ''}</Text>
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
                disabled = {(addingLink && !link.length) || links.length >= 10}
            />
        </View>

        <View style = {styles.buttonView}>
            <Button title="Add File" onPress={() => addFile()} disabled = {links.length >= 10 || addingFile}/>
        </View>

        <View style = {styles.buttonView}>
            <Button
                title = "Create"
                onPress = {() => createPost()}
                disabled = {loading || !title}
            />
        </View>

        {uploading == 0 || <Text style = {styles.uploadText}>Uploading... ({uploading}/{amountToUpload})</Text>}
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
    },
    image: {

    },
    uploadText: {
        color: 'white',
        textAlign: 'center'
    }
})