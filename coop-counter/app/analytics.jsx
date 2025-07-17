// Basic imports
import { StyleSheet, Text, View, Pressable, Dimensions, FlatList } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchData } from "../api/apiQuery";
// Import color pallet and icons
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'
import DailyGraph from '@/components/dailyGraph'
import WeeklyGraph from '@/components/weeklyGraph'

const totalChickens = 24;
const analytics = () => {
  const graphComponents = [
    { key: 'daily', component: <DailyGraph /> },
    { key: 'weekly', component: <WeeklyGraph /> },
  ];

  return (
    // Main container
    <View style={{ flex: 1, marginTop: 2 }}>
      <FlatList
        data={graphComponents}
        renderItem={({ item }) => item.component}
        keyExtractor={item => item.key}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

export default analytics

const styles = StyleSheet.create({
  
})
