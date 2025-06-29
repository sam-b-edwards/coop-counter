// Basic imports
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchData } from "../api/apiQuery";
// Import color pallet and icons
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'
import DailyGraph from '@/components/dailyGraph'
import WeeklyGraph from '@/components/weeklyGraph'

const totalChickens = 24;

const analytics = () => {
  return (
    // Main container
    <View style={{ flex: 1, marginTop: 2 }}>
      <DailyGraph />
      <WeeklyGraph />
    </View>
  );
}

export default analytics

const styles = StyleSheet.create({
  
})
