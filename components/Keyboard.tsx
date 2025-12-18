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
    // screenWidth - (paddingHorizontal do container * 2) - (marginHorizontal das teclas * numTeclas * 2)
    const marginHorizontal = 4; // Um pouco mais de espaço entre teclas
    const containerPadding = 8; // Margem segura das bordas
    const keyWidth = (screenWidth - (containerPadding * 2) - (marginHorizontal * 10 * 2)) / 10;
    const keyHeight = keyWidth * 1.4;

    const getKeyColor = (key: string) => {
        const state = keyStates[key];
        if (state === 'correct') return Colors.game.correct;
        if (state === 'present') return Colors.game.present;
        if (state === 'absent') return theme.key; // Agora mantem cor padrao ou cinza escuro, mas vamos usar opacidade
        return theme.key;
    };
    const getKeyTextColor = (key: string) => {
        if (keyStates[key]) return '#fff';
        return theme.keyText;
    };

    return (
        <View style={styles.keyboard}>
            {keys.map((row, i) => (
                <View key={i} style={styles.row}>
                    {row.map((key) => {
                        const isSpecial = key.length > 1; // Enter / Backspace
                        const textColor = getKeyTextColor(key);
                        let displayKey = key;
                        if (key === 'BACKSPACE') displayKey = '⌫';

                        const isAbsent = keyStates[key] === 'absent';

                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => onKeyPress(key)}
                                style={[
                                    styles.key,
                                    {
                                        backgroundColor: getKeyColor(key),
                                        width: isSpecial ? keyWidth * 1.5 : keyWidth,
                                        height: keyHeight,
                                        marginHorizontal: marginHorizontal,
                                        opacity: isAbsent ? 0.4 : 1 // "Apagadinhas"
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
        paddingHorizontal: 8, // Ajustado para bater com calculo (containerPadding)
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 8,
    },
    key: {
        justifyContent: 'center',
        alignItems: 'center',
        // marginHorizontal removido daqui pois está inline no componente
        borderRadius: 4,
    },
    keyText: {
        fontWeight: 'bold',
    },
});
