import 'react-native-url-polyfill/auto'
import { useState, useEffect, createContext } from 'react'
import { supabase } from './supabase'
import Auth from './components/Auth'
import Home from './components/Home'
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function App() {
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        })

        supabase.auth.onAuthStateChange((e, session) => {
            setSession(session);
        })
    }, [])

    return <>
        <StatusBar barStyle={'default'}/>
        <SafeAreaView style = {styles.main}>
            {session && session.user ? <Home session = {session}/> : <Auth/>}
        </SafeAreaView>
    </>
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#202020',
    }
})