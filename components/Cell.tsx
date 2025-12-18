import React from 'react';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import { CellData } from '../hooks/useGame';

type CellProps = {
    data: CellData;
    size?: number;
    isSelected?: boolean;
    onPress?: () => void;
};

export const Cell = ({ data, size = 50, isSelected, onPress }: CellProps) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

    // Estilo base da célula
    let backgroundColor = 'transparent';
    let borderColor = theme.cellBorder;

    // Define cores baseado no estado
    if (data.state === 'filled') {
        borderColor = theme.cellFilledBorder;
        // Força texto a ser visivel se estiver preenchido
    } else if (data.state === 'correct') {
        backgroundColor = Colors.game.correct;
        borderColor = Colors.game.correct;
    } else if (data.state === 'present') {
        backgroundColor = Colors.game.present;
        borderColor = Colors.game.present;
    } else if (data.state === 'absent') {
        backgroundColor = Colors.game.absent;
        borderColor = Colors.game.absent;
    }

    // Borda de seleção (override)
    if (isSelected) {
        borderColor = theme.tint; // Cor de destaque para o cursor
        // borderBottomWidth = 4; // Borda mais grossa embaixo estilo Termo original?
    }

    // Cor do texto
    const textColor = data.state !== 'empty' && data.state !== 'filled'
        ? '#fff' // Letra branca para estados coloridos (verde/amarelo/cinza)
        : theme.text; // Letra normal para digitando

    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        backgroundColor,
        borderColor,
        borderWidth: 2,
        borderBottomWidth: isSelected ? 4 : 2, // Highlight visual pro cursor
        justifyContent: 'center',
        alignItems: 'center',
        margin: 3,
        borderRadius: 4,
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8} disabled={!onPress}>
            <View style={containerStyle}>
                <Text style={[styles.text, { color: textColor, fontSize: size * 0.5 }]}>
                    {data.letter}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cell: {
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 3,
        borderRadius: 4, // Levemente arredondado tipo Termo
    },
    text: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});
