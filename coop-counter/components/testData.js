const testData = Array.from({ length: 24 }, (_, i) => ({
    chickenCount: Math.floor(Math.random() * 25), // random between 0 and 24
    certainty: [41, 47, 53, 58, 62, 66, 69, 73, 78, 83, 88, 92, 89, 84, 81, 77, 74, 79, 83, 87, 91, 96, 99, 100][i],
    time: `${i.toString().padStart(2, '0')}:00:00`
}));

export default testData;