import { useEffect, useState } from 'react';
import { getRandomWord, WORDS_6_LETTERS } from '../constants/Words';

export type CellState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export type CellData = {
  letter: string;
  state: CellState;
};

export type GameStatus = 'playing' | 'won' | 'lost';

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 6;

export const useGame = () => {
  const [word, setWord] = useState<string>('');
  // Grid: Matriz de 6x6 tentativas
  const [rows, setRows] = useState<CellData[][]>([]);
  
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColIndex, setCurrentColIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');

  // Novo estado para erro visual (shake/mensagem)
  const [invalidShake, setInvalidShake] = useState(false);

  // Inicializa o jogo
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newWord = getRandomWord();
    console.log('Palavra Secreta:', newWord); // Para debug
    setWord(newWord);
    
    // Cria grid vazio
    const emptyGrid = Array(MAX_ATTEMPTS).fill(null).map(() => 
      Array(WORD_LENGTH).fill({ letter: '', state: 'empty' })
    );
    setRows(emptyGrid);
    
    setCurrentRowIndex(0);
    setCurrentColIndex(0);
    setStatus('playing');
    setInvalidShake(false);
  };

  const handleKeyPress = (key: string) => {
    if (status !== 'playing') return;

    if (key === 'ENTER') {
      submitRow();
    } else if (key === 'BACKSPACE') {
      deleteLetter();
    } else {
      addLetter(key);
    }
  };

  const addLetter = (letter: string) => {
    if (currentColIndex >= WORD_LENGTH) return;

    const newRows = [...rows];
    newRows[currentRowIndex][currentColIndex] = { letter: letter.toUpperCase(), state: 'filled' };
    setRows(newRows);
    
    // Move para a proxima celula vazia se houver, ou a seguinte
    // Simplificação: apenas avança 1
    const nextIndex = currentColIndex + 1;
    if (nextIndex <= WORD_LENGTH) setCurrentColIndex(nextIndex);
  };

  const deleteLetter = () => {
    // Se estiver no final (indice 6), volta pro 5. Se estiver no 0, nao faz nada.
    // Lógica ajustada para apagar a letra na posicao ANTERIOR ao cursor, igual editores de texto
    const indexToDelete = currentColIndex > 0 && currentColIndex === WORD_LENGTH 
        ? currentColIndex - 1 
        : currentColIndex > 0 ? currentColIndex - 1 : 0;
        
    // Se o cursor estiver numa posição vazia, apaga a anterior.
    // Se estiver em cima de uma letra preenchida (seleção manual), apaga ela.
    
    const newRows = [...rows];
    // Se a célula atual já tem letra (por seleção manual), apaga ela
    if (newRows[currentRowIndex][currentColIndex]?.letter) {
         newRows[currentRowIndex][currentColIndex] = { letter: '', state: 'empty' };
         // Mantem cursor
    } else if (currentColIndex > 0) {
        // Comportamento padrao backspace
        newRows[currentRowIndex][currentColIndex - 1] = { letter: '', state: 'empty' };
        setCurrentColIndex(prev => prev - 1);
    }
    setRows(newRows);
  };

  const submitRow = () => {
    // Check length
    const currentGuess = rows[currentRowIndex].map(cell => cell.letter).join('');
    if (currentGuess.length < WORD_LENGTH || currentGuess.includes(' ')) {
      triggerInvalidAnimation();
      return;
    }

    // Valida se palavra existe
    if (!WORDS_6_LETTERS.includes(currentGuess)) {
       triggerInvalidAnimation(); 
       return; 
    }

    const newRows = [...rows];
    const solutionChars = word.split('');
    
    // 1. Identificar corretos (Verde)
    const currentRow = newRows[currentRowIndex].map((cell, i) => {
      if (cell.letter === solutionChars[i]) {
        solutionChars[i] = '#'; // Remove para não contar novamente como amarelo
        return { ...cell, state: 'correct' as CellState };
      }
      return cell;
    });

    // 2. Identificar presentes em lugar errado (Amarelo) e Ausentes (Cinza)
    const finalRow = currentRow.map((cell) => {
      if (cell.state === 'correct') return cell;

      const indexInSolution = solutionChars.indexOf(cell.letter);
      if (indexInSolution > -1) {
        solutionChars[indexInSolution] = '#'; // Remove
        return { ...cell, state: 'present' as CellState };
      } else {
        return { ...cell, state: 'absent' as CellState };
      }
    });

    newRows[currentRowIndex] = finalRow;
    setRows(newRows);

    // Verificar vitoria/derrota
    if (currentGuess === word) {
      setStatus('won');
    } else if (currentRowIndex >= MAX_ATTEMPTS - 1) {
      setStatus('lost');
    } else {
      setCurrentRowIndex(prev => prev + 1);
      setCurrentColIndex(0);
    }
  };

  // Animação/Feedback visual de erro
  const triggerInvalidAnimation = () => {
    setInvalidShake(true);
    setTimeout(() => setInvalidShake(false), 500);
  };

  // Selecionar célula manualmente
  const selectCell = (index: number) => {
      if (status !== 'playing') return;
      if (index < WORD_LENGTH && index >= 0) {
          setCurrentColIndex(index);
      }
  };

  // Calcula cores das teclas para o teclado
  const getKeyStyles = () => {
    const keys: Record<string, CellState> = {};
    
    // Varre todas as linhas JÁ SUBMETIDAS (menores que a atual)
    rows.slice(0, currentRowIndex).forEach(row => {
      row.forEach(cell => {
        const currentColor = keys[cell.letter];
        
        // Prioridade de Cores: Verde > Amarelo > Cinza
        if (cell.state === 'correct') {
          keys[cell.letter] = 'correct';
        } else if (cell.state === 'present' && currentColor !== 'correct') {
          keys[cell.letter] = 'present';
        } else if (cell.state === 'absent' && currentColor !== 'correct' && currentColor !== 'present') {
          keys[cell.letter] = 'absent';
        }
      });
    });
    return keys;
  };

  return {
    rows,
    currentRowIndex,
    currentColIndex,
    status,
    word,
    handleKeyPress,
    startNewGame,
    keyStates: getKeyStyles(),
    selectCell,
    invalidShake
  };
};
