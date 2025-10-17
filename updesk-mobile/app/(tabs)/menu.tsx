import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const cardData = [ //Info dos cartões do slide
  {
    title: 'Chamados abertos',
    icon: 'folder-open',
    info: 10
  },
  {
    title: 'Chamados em triagem',
    icon: 'search',
    info: 10
  },
  {
    title: 'Chamados com solução IA',
    icon: 'lightbulb-o',
    info: 10
  },
  {
    title: 'Chamados finalizados',
    icon: 'check-square',
    info: 10
  },
];

const { width } = Dimensions.get('window'); // Obtem largura da tela

export default function MenuScreen() {
  const flatListRef = useRef<FlatList<any>>(null); 

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={cardData}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <FontAwesome name={item.icon as any} size={30} color="#2B4C7E" />
            <Text style={styles.cardText}>{item.title}</Text>
            <Text style={styles.cardText}>{item.info}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 20,
    marginBottom: 20,
    color: '#2B4C7E',
  },
  card: {
    width: width - 80,
    height: 250,
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 16,
    marginVertical: 20, 
    marginHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    color: '#2B4C7E',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});