import Feed from './Feed';
import Account from './Account';
import NewPost from './NewPost';

import { useState, useReducer, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

function Page({ page, user, session, update }: { page: number, user: userInfo, session: Session, update: React.Dispatch<userInfo> }) {
    switch (page) {
        case 0:
            return <Account session = { session } update = {update}/>
        case 1:
            return <Feed user = {user}/>
        case 2:
            return <NewPost uid = {user.id}/>
        default:
            return <Text>Uh oh, you're not supposed to be here!!!</Text>
    }
    
}

export type userInfo = {
    id: string;
    name: string;
    picture: string;
}

function setUser(state: userInfo, action: userInfo) {
    return action;
}

export default function Home({ session }: { session: Session }) {
    const [page, setPage] = useState(1);
    const [user, dispatchUser] = useReducer(setUser, {id: session?.user.id, name: '', picture: ''});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        supabase.from('users').select('id, name, picture').eq('id', session?.user.id).returns<userInfo[]>()
            .then(({ data, error }) => {
                if (error) {
                    setError(true);
                } else {
                    dispatchUser(data[0]);
                }
                setLoading(false);
            })
        
    }, [])

    if (loading) {
        return <ActivityIndicator size = "large" color = "dodgerblue"/>
    }

    if (error) {
        return <Text>An error occurred</Text>
    }

    return (<SafeAreaView style = {styles.main}>
        <View style = {styles.content}>
            <Page user = {user} page = {page} session = {session} update = {dispatchUser}/>
        </View>
        <View style = {styles.bottom}>
            <View style = {styles.nav}>
                <TouchableOpacity style = {page == 0 ? styles.navSelected : styles.navUnselected} onPress = {() => { setPage(0) }}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>Account</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {page == 1 ? styles.navSelected : styles.navUnselected} onPress = {() => { setPage(1) }}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>Feed</Text>
                </TouchableOpacity>
                <TouchableOpacity style = {page == 2 ? styles.navSelected : styles.navUnselected} onPress = {() => { setPage(2) }}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>New Post</Text>
                </TouchableOpacity>
            </View>
        </View>
    </SafeAreaView>)
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        flexDirection: 'column',
    },
    nav: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        backgroundColor: 'black',
    },
    navUnselected: {
        padding: '1%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    navSelected: {
        padding: '1%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: 'dodgerblue'
    },
    image: {
        color: 'white'
    },
    label: {
        color: 'lightgrey'
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    bottom: {
        flexDirection: 'column',
        justifyContent: 'flex-end',
    }
})