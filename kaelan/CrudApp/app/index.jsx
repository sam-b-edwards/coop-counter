import { Text, View, TextInput, Pressable, StyleSheet, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from 'react';
import Icon from '@expo/vector-icons/MaterialIcons'

import { data } from '@/data/todos'

export default function Index() {
  const [todos, setTodos] = useState(data.sort((a,b) => b.id - a.id))
  const [text, setText] = useState('')

  const addTodo = () => {
    if (text.trim()) {
      const newId = todos.length > 0 ? todos[0].id + 1 : 1;
      setTodos([{id: newId, title: text, completed: false}, ...todos])
      setText('')
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed} : todo))
  }

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  const renderItem = ({ item }) => (
    <View style={[styles.todoItem, item.completed && styles.completedBox]}>
      <Text
        style={[styles.todoText, item.completed && styles.completedText]}
        onPress={() => toggleTodo(item.id)}
      >
        {item.title}
      </Text>
      <Pressable onPress={() => removeTodo(item.id)}><Icon name="delete" size={36} color="red" selectable={undefined} /></Pressable>
    </View>
  )

  return (
    <>
    <SafeAreaView style={styles.topBar} edges={['top']} />
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <View style={styles.topBar} width={'100%'}>
        <Text style={styles.title}>Todos</Text>
      </View>

      <View style={[styles.inputContainer, styles.topBar]}>
        <TextInput
          style={styles.input}
          placeholder="Add a new To Do"
          placeholderTextColor="#777777"
          value={text}
          onChangeText={setText}
        />
        <Pressable onPress={addTodo} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        showsVerticalScrollIndicator={false}
        style={styles.mainBackground}
        data={todos}
        renderItem={renderItem}
        keyExtractor={todo => todo.id}
        contentContainerStyle={{flexGrow: 1}}
      />

    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FEFAE0',
  },
  topBar: {
    backgroundColor: "#DDA15E",
  },
  title: {
    fontSize: 40,
    color: '#FEFAE0',
    fontWeight: 'bold',
    alignSelf: 'center',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alightItems: 'center',
    marginBottom: 0,
    padding: 10,
    width: '100%',
    maxWidth: 1024,
    marginHorizontal: 'auto',
    pointerEvents: 'auto',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    fontSize: 18,
    minWidth: 0,
    color: 'black',
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  addButtonText: {
    fontSize: 18,
    color: 'black',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    padding: 10,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    width: '100%',
    maxWidth: 1024,
    marginHorizontal: 'auto',
    pointerEvents: 'auto',
  },
  todoText: {
    flex: 1,
    fontSize: 18,
    color: '#283618',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#606C38',
  },
  completedBox: {
    backgroundColor: '#F5F3EB',
  },
})