import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { StyleSheet, SafeAreaView, View, Alert, Button, TextInput, Text } from 'react-native';
import { Session } from '@supabase/supabase-js';

import { userInfo } from './Home';

export default function Account({ page, session, update }: { page: number, session: Session, update: React.Dispatch<userInfo> }) {
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [picture, setPicture] = useState('');
    const [exists, setExists] = useState(true);

    

    useEffect(() => {
        if (session) {
            getProfile();
        }
    }, [session])

    async function createProfile(name: string, picture: string, bio: string) {
        setLoading(true);
        try {
            const { error } = await supabase.from('users').insert({
                id: session.user.id, 
                name: name, 
                bio: bio, 
                picture: picture
            });
            if (error) {
                console.log(error)
                throw error;
            }

            update({
                id: session.user.id,
                name: name, 
                picture: picture
            })
            
            setExists(true);
        } catch(error) {
            Alert.alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    async function getProfile() {
        try {
            setLoading(true)
            if (!session.user.id) {
                throw new Error('No user on the session!');
            }
            const { data, error } = await supabase
                .from('users')
                .select('name, bio, picture')
                .eq('id', session.user.id)
                .single();
            if (error) {
                if (error.code == 'PGRST116') {
                    setExists(false);
                } else {
                    throw error;
                }
            }            
            if (data) {
                setName(data.name);
                setBio(data.bio);
                setPicture(data.picture);
                update({
                    id: session.user.id,
                    name: data.name, 
                    picture: data.picture
                })
            }
        } catch (error) {
            Alert.alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile(name: string, picture: string, bio: string) {
        setLoading(true);
        try {
            if (!session.user) {
                throw new Error('No user on the session!');
            }
            const updates = {id: session.user.id, name, picture, bio};
            const { error } = await supabase.from('users').upsert(updates);
            if (error) {
                throw error;
            }
        
        } catch (error) {
            Alert.alert(error instanceof Error ? error.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }

    if (page != 0) {
        return;
    }

    return (<SafeAreaView style = {styles.main}>
        <Text style = {styles.title}>Account</Text>

        <Text style = {styles.label}>Email</Text>
        <Text style = {styles.email}>{session.user.email}</Text>

        <Text style = {styles.label}>Username</Text>
        <View style = {styles.textView}>
            <TextInput value = {name || ''} onChangeText = {(text) => setName(text)}/>
        </View>

        <Text style = {styles.label}>Description</Text>
        <View style = {styles.textView}>
            <TextInput value = {bio || ''} onChangeText = {(text) => setBio(text)}
                multiline = {true}
                numberOfLines = {4}
                textAlignVertical = "top"
            />
        </View>

        <View style = {styles.buttonView}>
            <Button
                title = {loading ? 'Loading ...' : (exists ? 'Update' : 'Create')}
                onPress = {() => {
                    if (exists) {
                        updateProfile(name, picture, bio);
                    } else {
                        createProfile(name, picture, bio);
                    }
                    
                }}
                disabled = {loading || !name}
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