import Feed from './Feed';
import Account from './Account';
import { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Button, Image, Text, TouchableOpacity } from 'react-native';
import { Session } from '@supabase/supabase-js';

//import accountImage from '../assets/account.png';

function Page({ page, session }: { page: number, session: Session }) {
    switch (page) {
        case 0:
            return <Account session = {session}/>
        case 1:
            return <Feed session = {session}/>
        default:
            return <Text>Uh oh, you're not supposed to be here!!!</Text>
    }
    
}

export default function Home({ session }: { session: Session }) {
    const [page, setPage] = useState(0);
    return (<SafeAreaView style = {styles.main}>
        <View style = {styles.content}>
            <Page session = {session} page = {page}/>
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
            </View>
        </View>
    </SafeAreaView>)
}
//
//}
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