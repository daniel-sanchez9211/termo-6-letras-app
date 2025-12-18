import { Stack } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Keyboard } from '../components/Keyboard';
import { Row } from '../components/Row';
import { Colors } from '../constants/Colors';
import { useGame } from '../hooks/useGame';

export default function HomeScreen() {
    const { rows, handleKeyPress, status, word, startNewGame, keyStates, currentRowIndex, currentColIndex, selectCell, invalidShake } = useGame();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Efeito para mostrar mensagem de vitoria/derrota
    // Efeito para mostrar mensagem de vitoria/derrota
    // (Removido Alert nativo conforme solicitado, usaremos apenas banners)
    // useEffect(() => { ... }, [status]);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                title: 'Termo (6 Letras)',
                headerStyle: { backgroundColor: theme.background },
                headerTintColor: theme.text,
                headerShadowVisible: false,
            }} />

            <View style={styles.headerSpacer}>
                {invalidShake && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>Palavra não encontrada / incompleta</Text>
                    </View>
                )}
                {status !== 'playing' && (
                    <View style={[styles.errorBanner, { backgroundColor: status === 'won' ? Colors.game.correct : Colors.game.error }]}>
                        <Text style={styles.errorText}>{status === 'won' ? 'VOCÊ VENCEU!' : `A PALAVRA ERA: ${word}`}</Text>
                        <TouchableOpacity onPress={startNewGame} style={styles.replayButton}>
                            <Text style={styles.replayText}>⟳</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Tabuleiro do Jogo */}
            <View style={styles.board}>
                {rows.map((row, i) => (
                    <Row
                        key={i}
                        cells={row}
                        isActive={i === currentRowIndex && status === 'playing'}
                        currentColIndex={currentColIndex}
                        onSelectCell={selectCell}
                    />
                ))}
            </View>

            {/* Espaçador flexivel para empurrar teclado pra baixo */}
            <View style={{ flex: 1 }} />

            {/* Teclado */}
            <Keyboard onKeyPress={handleKeyPress} keyStates={keyStates} />

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSpacer: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    board: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    errorBanner: {
        backgroundColor: '#000',
        padding: 10,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    errorText: {
        color: '#fff',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    replayButton: {
        paddingHorizontal: 8,
    },
    replayText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    }
});
