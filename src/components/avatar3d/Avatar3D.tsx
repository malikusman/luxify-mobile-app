import React, { Suspense } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import { useGLTF, Stage, OrbitControls } from '@react-three/drei/native';
import { useThemeColors } from '@/src/theme/Colors';

interface Avatar3DProps {
    modelUrl: string;
    scale?: number;
    position?: [number, number, number];
}

/**
 * 3D Model component that loads and displays a GLB/GLTF file
 */
function Model({ url, scale = 1.5, position = [0, 0, 0] }: { url: string; scale?: number; position?: [number, number, number] }) {
    try {
        const { scene } = useGLTF(url);
        
        return (
            <primitive 
                object={scene} 
                scale={scale} 
                position={position}
            />
        );
    } catch (error) {
        console.error('Error loading 3D model:', error);
        return null;
    }
}

/**
 * Loading fallback component
 */
function LoadingFallback() {
    const colors = useThemeColors();
    
    return (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.buttonPrimary || '#000'} />
        </View>
    );
}

/**
 * 3D Avatar Component
 * 
 * Renders a 3D avatar model using react-three-fiber
 * 
 * @param modelUrl - URL to the .glb or .gltf file
 * @param scale - Scale factor for the model (default: 1.5)
 * @param position - Position of the model [x, y, z]
 */
export default function Avatar3D({ 
    modelUrl, 
    scale = 1.5,
    position = [0, -1, 0]
}: Avatar3DProps) {
    const colors = useThemeColors();

    if (!modelUrl) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingFallback />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Canvas
                style={styles.canvas}
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ antialias: true }}
            >
                <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} />
                    <Stage
                        contactShadow={false}
                        intensity={0.6}
                        adjustCamera={1.5}
                    >
                        <Model url={modelUrl} scale={scale} position={position} />
                    </Stage>
                    <OrbitControls 
                        enablePan={true}
                        enableZoom={true}
                        enableRotate={true}
                        minDistance={3}
                        maxDistance={10}
                    />
                </Suspense>
            </Canvas>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    canvas: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

