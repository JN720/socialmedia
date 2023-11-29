import Feed from './Feed';
import Account from './Account';
import NewPost from './NewPost';
import People from './People';

import { useState, useReducer, useEffect } from 'react';
import { StyleSheet, View, SafeAreaView, Text, Pressable, ActivityIndicator } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

/*function Page({ page, user, session, update }: { page: number, user: userInfo, session: Session, update: React.Dispatch<userInfo> }) {
    return <>
        <Account page = {page} session = { session } update = {update}/>
        <Feed page = {page} user = {user} uid = {null}/>
        <NewPost page = {page} uid = {user.id}/>
        <People page = {page} user = {user}/>
    </>
}*/

export type userInfo = {
    id: string;
    name: string;
    picture: string;
}

function setUser(state: userInfo, action: userInfo) {
    return action;
}

function setPage(state: {page: number, user: string | null}, action: {page: number, user: string | null}) {
    return action;
}

export default function Home({ session }: { session: Session }) {
    const [page, dispatchPage] = useReducer(setPage, {page: 1, user: null});
    const [user, dispatchUser] = useReducer(setUser, {id: session?.user.id, name: '', picture: ''});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        supabase.from('users').select('id, name, picture').eq('id', session?.user.id).returns<userInfo[]>()
            .then(({ data, error }) => {
                if (error || data.length == 0) {
                    dispatchPage({page: 0, user: null});
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
    //<Page user = {user} page = {page} session = {session} update = {dispatchUser}/>
    return (<SafeAreaView style = {styles.main}>
        <View style = {styles.content}>
            <Account page = {page.page} session = { session } update = {dispatchUser}/>
            <Feed page = {page.page} setPage = {dispatchPage} user = {user} uid = {null}/>
            <NewPost page = {page.page} uid = {user.id}/>
            <People pageInfo = {page} setPage = {dispatchPage} user = {user}/>
        </View>
        <View style = {styles.bottom}>
            <View style = {styles.nav}>
                <Pressable style = {page.page == 0 ? styles.navSelected : styles.navUnselected} onPress = {() => { dispatchPage({page: 0, user: null}) }} disabled = {!user.name}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>Account</Text>
                </Pressable>
                <Pressable style = {page.page == 1 ? styles.navSelected : styles.navUnselected} onPress = {() => { dispatchPage({page: 1, user: null}) }} disabled = {!user.name}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>Feed</Text>
                </Pressable>
                <Pressable style = {page.page == 2 ? styles.navSelected : styles.navUnselected} onPress = {() => { dispatchPage({page: 2, user: null}) }} disabled = {!user.name}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>New Post</Text>
                </Pressable>
                <Pressable style = {page.page == 3 ? styles.navSelected : styles.navUnselected} onPress = {() => { dispatchPage({page: 3, user: null}) }} disabled = {!user.name}>
                    <Text style = {styles.image}>image</Text>
                    <Text style = {styles.label}>People</Text>
                </Pressable>
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