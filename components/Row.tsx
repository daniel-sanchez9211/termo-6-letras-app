import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CellData } from '../hooks/useGame';
import { Cell } from './Cell';

type RowProps = {
    cells: CellData[];
    isActive?: boolean;
    currentColIndex?: number;
    onSelectCell?: (index: number) => void;
    cellSize: number;
};

export const Row = ({ cells, isActive, currentColIndex, onSelectCell, cellSize }: RowProps) => {
    return (
        <View style={styles.row}>
            {cells.map((cell, index) => (
                <Cell
                    key={index}
                    data={cell}
                    size={cellSize}
                    isSelected={isActive && currentColIndex === index}
                    onPress={isActive && onSelectCell ? () => onSelectCell(index) : undefined}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },
});
