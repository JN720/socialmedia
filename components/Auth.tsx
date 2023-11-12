import React, { useState } from 'react'
import { Alert, StyleSheet, View, Button, TextInput, Text, TouchableHighlight } from 'react-native'
import { supabase } from '../supabase'

export default function Auth() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const { data: { session }, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) Alert.alert(error.message)
        if (!session) Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
    }

    return (<View style = {styles.main}>
        <Text style = {styles.text}>Welcome to Sosharu Media!</Text>
        <View style = {styles.textView}>
            <TextInput
                onChangeText = {(text: string) => setEmail(text)}
                value = {email}
                placeholder = "email@address.com"
                allowFontScaling = {true}
            />
        </View>
        <View style = {styles.textView}>
            <TextInput
                onChangeText = {(text: string) => setPassword(text)}
                value = {password}
                secureTextEntry = {true}
                placeholder = "Password"
                allowFontScaling = {true}
            />
        </View>
        <View style = {styles.buttonView}>
            <TouchableHighlight style = {styles.button}>
                <Button title = "Sign in" 
                    disabled = {loading} 
                    onPress={() => signInWithEmail()}
                    color = "dodgerblue"
                />
            </TouchableHighlight>
        </View>
        <View style = {styles.buttonView}>
            <TouchableHighlight style = {styles.button}>
                <Button 
                    title = "Sign up" 
                    disabled = {loading} 
                    onPress={() => signUpWithEmail()}
                    color = "blue"
                />
            </TouchableHighlight>
        </View>
    </View>)
}

const styles = StyleSheet.create({
    main: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        marginHorizontal: '5%',
        marginBottom: '7%',
        color: 'white',
        fontSize: 30,
        textAlign: 'center'
    },
    button: {
    },
    buttonView: {
        margin: '4%',
        backgroundColor: 'white',
        width: '50%',
        borderRadius: 15
    },
    textView: {
        marginVertical: '5%',
        padding: '2%',
        backgroundColor: 'white',
        width: '80%',
        borderRadius: 15
    }
});