import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { CellState } from '../hooks/useGame';

type KeyboardProps = {
    onKeyPress: (key: string) => void;
    keyStates: Record<string, CellState>;
};

const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ç'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

export const Keyboard = ({ onKeyPress, keyStates }: KeyboardProps) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const screenWidth = Dimensions.get('window').width;

    // Calcula largura da tecla dinamicamente para caber na tela
    const keyWidth = (screenWidth - 40) / 10;
    const keyHeight = keyWidth * 1.4;

    const getKeyColor = (key: string) => {
        const state = keyStates[key];
        if (state === 'correct') return Colors.game.correct;
        if (state === 'present') return Colors.game.present;
        if (state === 'absent') return Colors.game.absent;
        return theme.key;
    };

    const getKeyTextColor = (key: string) => {
        // Se tem cor de estado, texto é branco
        if (keyStates[key]) return '#fff';
        return theme.keyText;
    };

    return (
        <View style={styles.keyboard}>
            {keys.map((row, i) => (
                <View key={i} style={styles.row}>
                    {row.map((key) => {
                        const isSpecial = key.length > 1; // Enter / Backspace
                        const backgroundColor = getKeyColor(key);
                        const textColor = getKeyTextColor(key);

                        let displayKey = key;
                        if (key === 'BACKSPACE') displayKey = '⌫';

                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => onKeyPress(key)}
                                style={[
                                    styles.key,
                                    {
                                        backgroundColor,
                                        width: isSpecial ? keyWidth * 1.5 : keyWidth, // Teclas especiais mais largas
                                        height: keyHeight,
                                    }
                                ]}
                            >
                                <Text style={[
                                    styles.keyText,
                                    {
                                        color: textColor,
                                        fontSize: isSpecial ? 12 : 18
                                    }
                                ]}>
                                    {displayKey}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    keyboard: {
        paddingBottom: 20,
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    key: {
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 3,
        borderRadius: 4,
    },
    keyText: {
        fontWeight: 'bold',
    },
});
