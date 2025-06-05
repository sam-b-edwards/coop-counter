// Basic imports
import { StyleSheet, Text, View, Pressable, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { fetchData } from "../api/apiQuery";
// Import color pallet and icons
import * as PhosphorIcons from 'phosphor-react-native';
import colors from '@/constants/colors'
// import dailyData from '@/components/testData'
// Import Victory components for charts
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryScatter } from 'victory-native';

const totalChickens = 24;

const analytics = () => {
  // import data from database
  const userId = 6
  const endpointDaily = `user/images/hourly?userId=${userId}`
  const [dailyData, setDailyData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Find the last non-empty (non-zero) chickenCount value, but only in the displayed half of the data
  const displayedLength = dailyData ? Math.ceil(dailyData.length / 2) : 0;
  const defaultIndex = React.useMemo(() => {
    if (dailyData) {
      for (let i = displayedLength - 1; i >= 0; i--) {
        if (dailyData[i].chickenCount && dailyData[i].chickenCount !== 0) return i;
      }
    }
    return 0;
  }, [dailyData]);

  const [timePeriod, setTimePeriod] = useState('AM');
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);
  const [displayedData, setDisplayedData] = useState([]);
  const selectedPoint = displayedData[selectedIndex];
  

  useEffect(() => {
    handleSearch()
  }, [])

  useEffect(() => {
    if (dailyData) {    
    setIsLoading(false)
    }
  }, [dailyData])
  
  useEffect(() => {
    if (dailyData) {
      if (timePeriod == 'AM') {
        setDisplayedData(dailyData.slice(0, 12))
      } else {
        setDisplayedData(dailyData.slice(12, 24))
      }
    }
  }, [timePeriod, dailyData])

  const handleSearch = async () => {
    try {
      const resultDaily = await fetchData(endpointDaily);
      setDailyData(resultDaily)
    }
    catch (error) {
      throw error
    }
  }

  // format time for header
  let hour = 0;
  if (selectedPoint && selectedPoint.time !== undefined) {
      hour = Number(selectedPoint.time.split(':')[0])
    if (hour === 0) {
      hour = 12;
    } else if (hour > 12) {
      hour = hour - 12;
    }
    hour = hour.toString() + ':00'; 
  }

  // chart press handler (selects the point on the chart)
  const handleChartPress = (event) => {
    const { locationX } = event.nativeEvent;
    const chartWidth = Dimensions.get('window').width - 80;
    const step = chartWidth / (displayedData.length - 1);
    const idx = Math.round((locationX - 40) / step);
    setSelectedIndex(Math.max(0, Math.min(displayedData.length - 1, idx)));
  };
  
  // Return null while loading
  if (isLoading || dailyData.detail == 'Not Found' || dailyData.length != 24) {
    return null;
  }
  
  // dynamically calculate average, min, max, and certainty
  let avg = 0;
  let min = 0;
  let max = 0;
  let certainty = 0;
  
  if (dailyData && selectedPoint) {
    avg = selectedPoint.chickenCount;
    min = displayedData.reduce((min, point) => point.chickenCount < min ? point.chickenCount : min, Infinity);
    max = displayedData.reduce((max, point) => point.chickenCount > max ? point.chickenCount : max, -Infinity);
    certainty = selectedPoint.certainty || 0;
  }

  return (

    // Main container
    <View style={{ flex: 1, marginTop: 2 }}>

      {/* Daily graph */}
      <View style={styles.displayBox}>

        {/* Heading */}
        <Text style={styles.headingText}>Today</Text>
        <Text style={styles.timeValue}>{hour} <Text style={styles.ampm}>{timePeriod}</Text>
        <Pressable
          onPress={() => {
            setTimePeriod(timePeriod == 'AM' ? 'PM' : 'AM')
          }}
        >
          <PhosphorIcons.Swap size={20} style={styles.swapIcon}/>
        </Pressable></Text>

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

          {/* Graph for daily data */}
          <VictoryChart
            height={200}
            padding={{ top: 20, bottom: 40, left: 40, right:20 }}
            domain={{ x: [1, 12], y: [0, totalChickens + 0.5] }}
          >

            {/* x axis */}
            <VictoryAxis
              style={{
                ticks: { stroke: '#ddd', size: 5 },
                tickLabels: { fontSize: 14, fill: colors.textSecondary, padding: 8 }
              }}
              tickFormat={(t) => [0, 3, 6, 9].includes(Number(t.split(':')[0])) ? Number(t.split(':')[0]) == 0 ? `12` : `${Number(t.split(':')[0])}` : ''
              || [12, 15, 18, 21].includes(Number(t.split(':')[0])) ? Number(t.split(':')[0]) == 12 ? `12` : `${Number(t.split(':')[0]) - 12}` : ''
            }
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
              x="time"
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
              x="time"
              y="chickenCount"
              style={{ data: { stroke: colors.primary, strokeWidth: 1 } }}
            />

            {/* dots on the graph */}
            <VictoryScatter
              data={displayedData}
              x="time"
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
                  { time: displayedData[selectedIndex]?.time, chickenCount: 0 },
                  { time: displayedData[selectedIndex]?.time, chickenCount: totalChickens}
                ]}
                x="time"
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


    </View>
  );
}



export default analytics

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