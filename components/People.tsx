import { useState, useEffect, useReducer } from "react";
import { Text, Button, FlatList, View, ActivityIndicator, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { supabase } from "../supabase";

import Person, { personType } from './Person';
import { randomUUID } from "expo-crypto";
import { userInfo } from "./Home";

async function getPeople(uid: string): Promise<personType[]> {
    const { data, error } = await supabase.rpc('get_users', {user_uuid: uid}).returns<personType[]>();
    if (error) {
        throw error;
    }
    return data;
}

function setCurrentPerson(state: string | null, action: string | null) {
    return action;
}

export default function People({ user }: { user: userInfo }) {
    const [loading, setLoading] = useState(0);
    const [error, setError] = useState(false);

    const [people, setPeople] = useState<personType[]>([]);
    const [currentPerson, dispatchCurrentPerson] = useReducer(setCurrentPerson, null);

    function fetchPeople() {
        getPeople(user.id)
            .then((posts) => {
                setPeople(posts);
                setError(false);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(0));
    }

    async function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
        if (loading == 0 && e.nativeEvent.contentOffset.y <= 5 && e.nativeEvent.velocity?.y && e.nativeEvent.velocity.y < -0.9) {
            setLoading(2);
            setTimeout(fetchPeople, 500);
        }

    }

    useEffect(() => {
        setLoading(1);
        fetchPeople();
    }, []);

    if (loading == 1) {
        return <ActivityIndicator color = "dodgerblue" size = "large"/>
    }
    if (error) {
        return <>
            <Text style = {styles.errorText}>Uh oh we couldn't find people D:</Text>
            <Button title = "Retry" 
                onPress = {() => fetchPeople()} 
                color = "red"
            />
        </>
    }
    if (people.length) {
        return <>
            {(loading < 2 || !!currentPerson) || <ActivityIndicator style = {styles.feedSpinner} color = "dodgerblue" size = "large"/>}
            {!currentPerson || <View style = {styles.backButton}>
                <Button title = "back" color = "red" onPress = {() => dispatchCurrentPerson(null)}/>
                {loading < 2 || <ActivityIndicator style = {styles.commentSpinner} color = "dodgerblue" size = "large"/>}
            </View>}
            <FlatList style = {styles.main} keyExtractor = {() => randomUUID()} data = {people} onScroll = {handleScroll} renderItem = {({ item }) => {
                return (!currentPerson || item.id == currentPerson) ? <Person item = {item} uid = {user.id} select = {dispatchCurrentPerson}/> : null
            }}/>
            {//!currentPerson || <NewComment comments = {comments} setComments = {dispatchComments} postId = {currentPerson} user = {user} reply = {reply} setReply = {dispatchReply}/>}
            }
        </>
    } else {
        return <View style = {styles.empty}>
            <Text style = {styles.emptyText}>No people here!</Text>
        </View>
    }
}

const styles = StyleSheet.create({
    main: {
        flexShrink: 1,
        marginTop: '1%',
        marginBottom: '4%',
        marginHorizontal: '5%'
    },
    empty: {
        marginTop: '25%',
        marginHorizontal: '15%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyText: {
        color: 'white',
        fontSize: 60,
        textAlign: 'center'
    },
    loadingText: {
        color: 'white',
        fontSize: 60,
        textAlign: 'center'
    },
    errorText: {
        color: 'red',
        fontSize: 60,
        textAlign: 'center'
    },
    backButton: {
        marginTop: '2%',
        marginStart: '2%',
        flexDirection: 'row',
        width: '20%'
    },
    feedSpinner: {
        marginTop: '2%'
    },
    commentSpinner: {
        marginStart: '6%',
        alignSelf: 'center'
    }
})