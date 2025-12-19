import { Stack } from 'expo-router';
import React from 'react';
import { Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Keyboard } from '../components/Keyboard';
import { Row } from '../components/Row';
import { Colors } from '../constants/Colors';
import { useGame } from '../hooks/useGame';

export default function HomeScreen() {
    const {
        rows,
        currentRowIndex,
        currentColIndex,
        status,
        word,
        wordLength,       // NOVO
        setWordLength,    // NOVO
        handleKeyPress,
        startNewGame,
        keyStates,
        selectCell,
        invalidShake
    } = useGame(6); // Começa com 6 letras
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Array de dificuldades
    // Array de dificuldades
    const SIZES = [5, 6, 7, 8];

    // Calculo Dinamico do tamanho da celula
    const { width } = Dimensions.get('window');
    // Margem lateral total de segurança (90px garante que não corte nem em telas estreitas)
    const MAX_WIDTH = Math.min(width, 500) - 90;
    // Subtrai margens das celulas (6px total por celula: 3 esq + 3 dir)
    const availableWidth = MAX_WIDTH - (wordLength * 6);
    const calculatedCellSize = Math.floor(availableWidth / wordLength);

    // Limita tamanho maximo (60px) e minimo razoavel
    const finalCellSize = Math.min(Math.max(calculatedCellSize, 30), 60);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{
                headerShown: true,
                title: 'Termo (Brasil)', // Título estático generico
                headerStyle: { backgroundColor: theme.background },
                headerTitleStyle: { color: theme.text },
                headerShadowVisible: false,
            }} />

            <View style={styles.headerSpacer}>
                {/* Seletor de Dificuldade (Sempre visível) */}
                <View style={styles.difficultyContainer}>
                    <Text style={[styles.difficultyLabel, { color: theme.text }]}>Tamanho:</Text>
                    <View style={styles.difficultyButtons}>
                        {SIZES.map(size => (
                            <TouchableOpacity
                                key={size}
                                onPress={() => {
                                    setWordLength(size);
                                }}
                                style={[
                                    styles.sizeButton,
                                    wordLength === size && { backgroundColor: Colors.game.correct }
                                ]}
                            >
                                <Text style={[
                                    styles.sizeButtonText,
                                    { color: wordLength === size ? '#fff' : theme.text }
                                ]}>{size}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {invalidShake && (
                    <View style={styles.errorBanner}>
                        <Text style={styles.errorText}>Palavra inválida</Text>
                    </View>
                )}
                {/* Banner de Resultado */}
                {status !== 'playing' && (
                    <View style={[styles.errorBanner, { backgroundColor: status === 'won' ? Colors.game.correct : Colors.game.error, flexDirection: 'column', padding: 10 }]}>
                        <Text style={styles.errorText}>{status === 'won' ? 'VOCÊ VENCEU!' : `A PALAVRA ERA: ${word}`}</Text>
                        <TouchableOpacity onPress={() => startNewGame()} style={[styles.replayButton, { marginTop: 10 }]}>
                            <Text style={styles.replayText}>Jogar Novamente</Text>
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
                        cellSize={finalCellSize}
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
        alignItems: 'center',
        paddingHorizontal: 20, // Padding lateral da tela toda
    },
    headerSpacer: {
        minHeight: 80, // Mais altura para os controles
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: 10,
    },
    board: {
        gap: 5,
        paddingBottom: 20,
        // Limita largura máxima para não estourar em iPad/Web
        maxWidth: 500,
        width: '100%',
        alignItems: 'center',
    },
    errorBanner: {
        backgroundColor: '#333',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        width: '100%',
    },
    errorText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    replayButton: {
        backgroundColor: 'rgba(0,0,0,0.2)',
        padding: 8,
        borderRadius: 5,
    },
    replayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    difficultyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    difficultyLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    },
    difficultyButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    sizeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sizeButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});
