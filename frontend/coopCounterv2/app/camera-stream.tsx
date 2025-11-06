import { View, Text, Pressable, Dimensions, StatusBar } from 'react-native'
import { XIcon } from 'phosphor-react-native'
import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { WebView } from 'react-native-webview'
import * as SecureStore from 'expo-secure-store'
import { isDemoUser } from '@/utils/demoData'

export default function CameraStream() {
    const router = useRouter()
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [userId, setUserId] = useState<string>('6')
    const webViewRef = useRef(null)

    // WebSocket configuration
    const CAMERA_ID = '1009'
    const WEBSOCKET_URL = `ws://coopcounter.comdevelopment.com/ws/stream/watch/${CAMERA_ID}?user_id=${userId}`
    const IS_DEMO = isDemoUser(userId)

    // Get user ID from secure store
    useEffect(() => {
        async function getUserId() {
            const storedUserId = await SecureStore.getItemAsync('user')
            if (storedUserId) {
                setUserId(storedUserId)
            }
        }
        getUserId()
    }, [])

    // Handle orientation changes
    useEffect(() => {
        const handleOrientationChange = async () => {
            const currentOrientation = await ScreenOrientation.getOrientationAsync()

            if (currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
                currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT) {
                setIsFullscreen(true)
                StatusBar.setHidden(true)
            } else {
                setIsFullscreen(false)
                StatusBar.setHidden(false)
            }
        }

        // Set initial orientation
        handleOrientationChange()

        // Listen for orientation changes
        const subscription = ScreenOrientation.addOrientationChangeListener(() => {
            handleOrientationChange()
        })

        // Allow all orientations for this screen
        ScreenOrientation.unlockAsync()

        return () => {
            // Clean up
            ScreenOrientation.removeOrientationChangeListener(subscription)
            // Lock to portrait when leaving
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
            StatusBar.setHidden(false)
        }
    }, [])

    const handleClose = () => {
        router.back()
    }

    // HTML for WebView to display video stream
    const videoHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                }
                #streamImage {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    display: none;
                }
                #status {
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                .status-info {
                    color: #22c55e;
                    font-size: 12px;
                    line-height: 1.4;
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: rgba(0,0,0,0.7);
                    padding: 8px 12px;
                    border-radius: 8px;
                    font-family: monospace;
                }
                .error {
                    color: #ef4444;
                }
            </style>
        </head>
        <body>
            <div id="status">Connecting to camera stream...</div>
            <img id="streamImage" />
            <div id="frameInfo" class="status-info" style="display:none;"></div>

            <script>
                const statusEl = document.getElementById('status');
                const imageEl = document.getElementById('streamImage');
                const frameInfoEl = document.getElementById('frameInfo');

                let ws = null;
                let frameCount = 0;
                let reconnectTimeout = null;
                const IS_DEMO = ${IS_DEMO};

                function connect() {
                    // Demo mode - just show text
                    if (IS_DEMO) {
                        // Show "Demo Mode" in center
                        statusEl.textContent = 'Demo Mode';
                        statusEl.style.display = 'block';
                        statusEl.style.color = 'white';
                        statusEl.style.fontSize = '18px';
                        statusEl.style.position = 'absolute';
                        statusEl.style.top = '50%';
                        statusEl.style.left = '50%';
                        statusEl.style.transform = 'translate(-50%, -50%)';
                        statusEl.style.background = 'rgba(0,0,0,0.5)';
                        statusEl.style.padding = '12px 24px';
                        statusEl.style.borderRadius = '8px';

                        // Show fake frame info in top right
                        let demoFrameCount = 0;
                        setInterval(() => {
                            demoFrameCount++;
                            const now = new Date();
                            const frameTime = now.toLocaleTimeString();
                            frameInfoEl.innerHTML = 'Frame #' + demoFrameCount + '<br/>' + frameTime;
                            frameInfoEl.style.display = 'block';
                        }, 100); // Update every 100ms to simulate ~10fps

                        return;
                    }

                    statusEl.textContent = 'Connecting to coop camera...';
                    statusEl.style.display = 'block';

                    try {
                        ws = new WebSocket('${WEBSOCKET_URL}');

                        ws.onopen = () => {
                            console.log('Connected to stream');
                            statusEl.textContent = 'Connected! Waiting for frames...';
                            if (reconnectTimeout) {
                                clearTimeout(reconnectTimeout);
                                reconnectTimeout = null;
                            }
                        };

                        ws.onmessage = (event) => {
                            try {
                                const message = JSON.parse(event.data);

                                if (message.type === 'status') {
                                    // Handle status messages
                                    console.log('Status:', message.message);
                                    if (!message.is_streaming) {
                                        statusEl.textContent = message.message;
                                        statusEl.style.display = 'block';
                                        imageEl.style.display = 'none';
                                    }
                                } else if (message.type === 'frame') {
                                    // Handle frame data with actual frame_number and timestamp from message
                                    frameCount++;

                                    // Update image with base64 data
                                    imageEl.src = 'data:image/jpeg;base64,' + message.data;
                                    imageEl.style.display = 'block';
                                    statusEl.style.display = 'none';

                                    // Update frame info with actual frame number from WebSocket
                                    const frameTime = new Date(message.timestamp * 1000).toLocaleTimeString();
                                    frameInfoEl.innerHTML = 'Frame #' + message.frame_number + '<br/>' + frameTime;
                                    frameInfoEl.style.display = 'block';

                                    // Log every 100 frames
                                    if (message.frame_number % 100 === 0) {
                                        console.log('Frame #' + message.frame_number + ' at ' + frameTime);
                                        console.log('Total frames received:', frameCount);
                                    }
                                }
                            } catch (error) {
                                console.error('Failed to parse message:', error);
                            }
                        };

                        ws.onerror = (error) => {
                            console.error('WebSocket error:', error);
                            statusEl.textContent = 'Connection error. Retrying...';
                            statusEl.className = 'error';
                        };

                        ws.onclose = (event) => {
                            console.log('Connection closed:', event.code, event.reason);
                            statusEl.textContent = 'Connection lost. Reconnecting...';
                            statusEl.style.display = 'block';
                            imageEl.style.display = 'none';
                            frameInfoEl.style.display = 'none';
                            scheduleReconnect();
                        };

                    } catch (error) {
                        console.error('Connection error:', error);
                        statusEl.textContent = 'Failed to connect. Retrying...';
                        statusEl.className = 'error';
                        scheduleReconnect();
                    }
                }

                function scheduleReconnect() {
                    if (reconnectTimeout) {
                        clearTimeout(reconnectTimeout);
                    }
                    reconnectTimeout = setTimeout(() => {
                        connect();
                    }, 3000);
                }

                // Start connection
                connect();

                // Clean up on page unload
                window.addEventListener('beforeunload', () => {
                    if (ws) {
                        ws.close();
                    }
                    if (reconnectTimeout) {
                        clearTimeout(reconnectTimeout);
                    }
                });
            </script>
        </body>
        </html>
    `

    return (
        <View className={`flex-1 bg-black ${isFullscreen ? '' : 'pt-12'}`}>
            {/* Close button - only visible in portrait mode */}
            {!isFullscreen && (
                <Pressable
                    onPress={handleClose}
                    className="absolute top-14 left-4 z-10 bg-black/50 rounded-full p-2"
                >
                    <XIcon size={28} color="white" weight="bold" />
                </Pressable>
            )}

            {/* Camera stream container */}
            <View className="flex-1 justify-center items-center">
                <WebView
                    ref={webViewRef}
                    source={{ html: videoHTML }}
                    style={{
                        flex: 1,
                        width: Dimensions.get('window').width,
                        backgroundColor: '#000'
                    }}
                    scrollEnabled={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                />
            </View>

            {/* Rotation hint - only show in portrait */}
            {!isFullscreen && (
                <View className="absolute bottom-8 self-center bg-black/70 px-4 py-2 rounded-full">
                    <Text className="text-white text-sm">Rotate device for fullscreen</Text>
                </View>
            )}
        </View>
    )
}