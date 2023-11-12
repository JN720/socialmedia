import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { StyleSheet, SafeAreaView, View, Alert, Button, TextInput, Text } from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function Account({ session }: { session: Session}) {
    const [loading, setLoading] = useState(true)
    const [username, setUsername] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    useEffect(() => {
        if (session) getProfile()
    }, [session])

    async function getProfile() {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`username, website, avatar_url`)
                .eq('id', session?.user.id)
                .single()
            if (error && status !== 406) throw error
            if (data) {
                setUsername(data.username)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            if (error instanceof Error) Alert.alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateProfile({ username, avatar_url }: {username: string, avatar_url: string}) {
        try {
            setLoading(true)
            if (!session?.user) throw new Error('No user on the session!')
            const updates = {
                id: session?.user.id,
                username,
                avatar_url,
                updated_at: new Date(),
            }
            const { error } = await supabase.from('profiles').upsert(updates)
            if (error) throw error
        
        } catch (error) {
            if (error instanceof Error) Alert.alert(error.message)
        } finally {
            setLoading(false)
        }
  }

  return (
    <SafeAreaView style = {styles.main}>
        <Text style = {styles.title}>Account</Text>
        <Text style = {styles.label}>Email</Text>
        <View style = {styles.textView}>
            <TextInput value = {session?.user?.email}/>
        </View>
        <Text style = {styles.label}>Username</Text>
        <View style = {styles.textView}>
            <TextInput value = {username || ''} onChangeText = {(text) => setUsername(text)}/>
        </View>

        <View style = {styles.buttonView}>
            <Button
                title = {loading ? 'Loading ...' : 'Update'}
                onPress = {() => updateProfile({ username, avatar_url: avatarUrl })}
                disabled = {loading || !username}
            />
        </View>

        <View style = {styles.buttonView}>
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()}/>
        </View>
    </SafeAreaView>
  )
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
    }
})