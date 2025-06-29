// Basic imports
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchData } from "../api/apiQuery";
// Import color pallet and icons
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'
import testData from '@/components/testData'
// Import Victory components for charts
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryScatter } from 'victory-native';


const useRealData = true

const weeklyGraph = () => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState(null);
  const [displayedData, setDisplayedData] = useState([]);
  const [totalChickens, setTotalChickens] = useState(24);

  // Calculate defaultIndex based on weeklyData
  const displayedLength = weeklyData ? Math.ceil(weeklyData.length / 2) : 0;
  const defaultIndex = React.useMemo(() => {
    if (weeklyData) {
      for (let i = displayedLength - 1; i >= 0; i--) {
        if (weeklyData[i]?.chickenCount && weeklyData[i].chickenCount !== 0) return i;
      }
    }
    return 0;
  }, [weeklyData]);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const selectedPoint = displayedData[selectedIndex];
  
  const userId = 6;
  

  const [date, setDate] = useState(new Date())
  const currentDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
  const [queryDate, setQueryDate] = useState(currentDate)

  const changeDate = (amount) => {
    const tempDate = new Date(date)
    const newDate = new Date(tempDate.setDate(tempDate.getDate() + amount))
    let newQueryDate = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${newDate.getDate()}`

    if (newDate <= new Date()) {
      setDate(newDate);
      setQueryDate(newQueryDate);
    }
  };


  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (useRealData) {
        try {
          const endpointUser = `user/info?userId=${userId}`;
          const resultUser = await fetchData(endpointUser);
          setTotalChickens(resultUser?.totalChickens);
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      } else {
        setWeeklyData(testData);
      }
    };
    
    fetchInitialData();
  }, []);

  useEffect(() => {
    
    const fetchWeeklyData = async () => {
      const endpointWeekly = `user/images/weekly?userId=${userId}&date=${queryDate}`;
      const resultWeekly = await fetchData(endpointWeekly);
      setWeeklyData(resultWeekly);
      console.log(resultWeekly);
    };
    fetchWeeklyData();
    
  }, [queryDate]);

  

  // Update loading state when data changes
  useEffect(() => {
    if (weeklyData) {
      setIsLoading(false);
    }
  }, [weeklyData]);

  // Return early if loading or invalid data
  if (isLoading || !weeklyData || weeklyData.detail === 'Not Found' || weeklyData.length !== 24) {
    return null;
  }

  // Chart interaction handler
  const handleChartPress = (event) => {
    const { locationX } = event.nativeEvent;
    const chartWidth = Dimensions.get('window').width - 80;
    const step = chartWidth / (displayedData.length - 1);
    const idx = Math.round((locationX - 40) / step);
    setSelectedIndex(Math.max(0, Math.min(displayedData.length - 1, idx)));
  };

  // Calculate stats
  const avg = selectedPoint?.chickenCount || 0;
  const min = displayedData.reduce((min, point) => 
    point.chickenCount < min ? point.chickenCount : min, Infinity) || 0;
  const max = displayedData.reduce((max, point) => 
    point.chickenCount > max ? point.chickenCount : max, -Infinity) || 0;
  const certainty = selectedPoint?.certainty || 0;

  

  return (
    
      <View style={styles.displayBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 }}>
          <Pressable onPress={() => changeDate(-7)}>
            <PhosphorIcons.CaretLeft/>
          </Pressable>
            <Text style={styles.headingText}>
              {queryDate === currentDate
                ? 'This Week'
                : (() => {
              const parts = queryDate.split('-');
              // parts: [year, month, day]
              const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              return `${monthNames[Number(parts[1]) - 1]} ${parts[2]}`;
                  })()}
            </Text>
            <Pressable onPress={() => changeDate(7)}>
            <PhosphorIcons.CaretRight/>
          </Pressable>
        </View>

        {/* Quick info displays */}
        <View style={styles.allQuickInfoContainer}>

          <View style={styles.quickInfoContainer}>
            <Text style={styles.quickInfoLabel}>Avg Count</Text>
            <Text style={styles.quickInfoValue}>{avg}</Text>
          </View>
          
          <View style={styles.quickInfoContainer}>
            <Text style={styles.quickInfoLabel}>Certainty</Text>
            <Text style={styles.quickInfoValue}>{certainty}%</Text>
          </View>

          <View style={styles.quickInfoContainer}>
            <Text style={styles.quickInfoLabel}>Min</Text>
            <Text style={styles.quickInfoValue}>{min}</Text>
          </View>

          <View style={styles.quickInfoContainer}>
            <Text style={styles.quickInfoLabel}>Max</Text>
            <Text style={styles.quickInfoValue}>{max}</Text>
          </View>

        </View>

          <View style={{ position: 'relative' }}>

          {/* Graph for weekly data */}
          <VictoryChart
            height={200}
            padding={{ top: 20, bottom: 40, left: 20 + 10 * String(totalChickens/2).length, right: 20 }}
            domain={{ x: [1, 7], y: [0, totalChickens] }}
          >

            {/* x axis */}
            <VictoryAxis
              style={{
                ticks: { stroke: '#ddd', size: 5 },
                tickLabels: { fontSize: 14, fill: colors.textSecondary, padding: 8 }
              }}
            />

            {/* y axis */}
            <VictoryAxis
              dependentAxis
              style={{
                axis: { stroke: '#00000000' },
                grid: { stroke: colors.backgroundSecondary },
                tickLabels: { fontSize: 14, fill: colors.textSecondary, padding: 20 }
              }}
              tickValues={[0, totalChickens / 2, totalChickens]}
            />

            {/* area under the line on the graph */}
            <VictoryArea
              data={displayedData}
              x="dayOfWeek"
              y="chickenCount"
              style={{
                data: {
                  fill: colors.primary + '33',
                }
              }}
            />

            {/* line on the graph */}
            <VictoryLine
              data={displayedData}
              x="dayOfWeek"
              y="chickenCount"
              style={{ data: { stroke: colors.primary, strokeWidth: 1 } }}
            />

            {/* dots on the graph */}
            <VictoryScatter
              data={displayedData}
              x="dayOfWeek"
              y="chickenCount"
              size={4}
              style={{
                data: {
                  fill: ({ index }) => selectedIndex === index ? colors.primary : colors.backgroundPrimary,
                  stroke: ({ index }) => selectedIndex === index ? colors.primary + '33' : colors.primary,
                  strokeWidth: ({ index }) => selectedIndex === index ? 6 : 1.2,
                }
              }}
            />
            {/* vertical line for selected point */}
            {selectedIndex !== null && (
              <VictoryLine
                data={[
                  { dayOfWeek: displayedData[selectedIndex]?.dayOfWeek, chickenCount: 0 },
                  { dayOfWeek: displayedData[selectedIndex]?.dayOfWeek, chickenCount: totalChickens}
                ]}
                x="dayOfWeek"
                y="chickenCount"
                style={{ data: { stroke: colors.primary, strokeWidth: 1.5, strokeDasharray: '4,2' } }}
              />
            )}

          </VictoryChart>

          {/* Touch overlay for graph */}
          <View
            style={styles.touchOverlay}
            pointerEvents="box-none"
          >
            <View
              style={{ flex: 1 }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={handleChartPress}
              onResponderMove={handleChartPress}
            />
          </View>
        </View>
        
      </View>
  )

}



export default weeklyGraph

const styles = StyleSheet.create({
  displayBox: { 
    backgroundColor: colors.backgroundPrimary, 
    padding: 10,
    marginBottom: 6
  },
  quickInfoLabel: {
    color: '#444', 
    fontSize: 12, 
  },
  quickInfoValue: {
    fontWeight: 600, 
    fontSize: 18
  },
  quickInfoContainer: { 
    alignItems: 'flex-start', 
    marginRight: 20 
  },
  headingText: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    marginVertical: 12, 
    textAlign: 'center' 
  },
  timeValue: { 
    fontSize: 18, 
    fontWeight: 600, 
    marginBottom: 8, 
    marginLeft: 40 
  },
  ampm: { 
    fontSize: 10, 
    fontWeight: 'normal' 
  },
  allQuickInfoContainer: { 
    flexDirection: 'row', 
    marginBottom: 12, 
    marginLeft: 40 
  },
  touchOverlay: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0,
  },
  swapIcon: {
    marginLeft: 10,
    marginBottom: -3,
    color: colors.textPrimary
  }
})