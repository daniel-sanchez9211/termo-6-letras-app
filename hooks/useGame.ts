
import { useEffect, useState } from 'react';
import { getRandomWord, WORDS } from '../constants/Words';

export type CellState = 'empty' | 'filled' | 'correct' | 'present' | 'absent';

export type CellData = {
  letter: string;
  state: CellState;
};

export type GameStatus = 'playing' | 'won' | 'lost';

const MAX_ATTEMPTS = 6;

export const useGame = (initialWordLength = 6) => {
  const [wordLength, setWordLength] = useState(initialWordLength);
  const [word, setWord] = useState<string>('');
  
  // Grid: Matriz de 6x(wordLength) tentativas
  const [rows, setRows] = useState<CellData[][]>([]);
  
  const [currentRowIndex, setCurrentRowIndex] = useState(0);
  const [currentColIndex, setCurrentColIndex] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');

  // Novo estado para erro visual (shake/mensagem)
  const [invalidShake, setInvalidShake] = useState(false);

  // Inicializa o jogo quando muda o tamanho
  useEffect(() => {
    startNewGame(wordLength);
  }, [wordLength]);

  const startNewGame = (length: number = wordLength) => {
    // Garante que o length está atualizado no state se chamado externamente
    if (length !== wordLength) setWordLength(length);
    
    // Pega palavra aleatoria do tamanho correto
    const newWord = getRandomWord(length);
    console.log(`Nova Palavra Secreta (${length}):`, newWord);
    setWord(newWord);
    
    // Cria grid vazio dinâmico
    const emptyGrid = Array(MAX_ATTEMPTS).fill(null).map(() => 
      Array(length).fill({ letter: '', state: 'empty' })
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
    const newRows = [...rows];
    newRows[currentRowIndex][currentColIndex] = { letter: letter.toUpperCase(), state: 'filled' };
    setRows(newRows);
    
    // Busca próximo slot vazio (Search Forward)
    let nextIndex = currentColIndex;
    let foundEmpty = false;
    
    // Testa as próximas posições
    for (let i = 1; i < wordLength; i++) {
        const candidateIndex = (currentColIndex + i) % wordLength;
        const candidateCell = newRows[currentRowIndex][candidateIndex];
        
        if (!candidateCell.letter || candidateCell.state === 'empty') {
            nextIndex = candidateIndex;
            foundEmpty = true;
            break; 
        }
    }
    
    if (foundEmpty) {
        setCurrentColIndex(nextIndex);
    }
  };

  const deleteLetter = () => {
    // Lógica ajustada para usar wordLength variavel
    const indexToDelete = currentColIndex > 0 && currentColIndex === wordLength 
        ? currentColIndex - 1 
        : currentColIndex > 0 ? currentColIndex - 1 : 0;
        
    const newRows = [...rows];
    if (newRows[currentRowIndex][currentColIndex]?.letter) {
         newRows[currentRowIndex][currentColIndex] = { letter: '', state: 'empty' };
    } else if (currentColIndex > 0) {
        newRows[currentRowIndex][currentColIndex - 1] = { letter: '', state: 'empty' };
        setCurrentColIndex(prev => prev - 1);
    }
    setRows(newRows);
  };

  const submitRow = () => {
    const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const currentGuess = rows[currentRowIndex].map(cell => cell.letter).join('');
    
    // Check length
    if (currentGuess.length < wordLength || currentGuess.includes(' ')) {
      triggerInvalidAnimation();
      return;
    }

    // Valida no dicionário correto
    const validList = WORDS[wordLength]?.validGuesses || [];
    const validWordEntry = validList.find(w => normalize(w) === currentGuess);

    if (!validWordEntry) {
       triggerInvalidAnimation(); 
       return; 
    }

    const newRows = [...rows];
    
    const secretNormalized = normalize(word);
    const solutionChars = secretNormalized.split('');
    
    // 1. Identificar corretos (Verde)
    const currentRow = newRows[currentRowIndex].map((cell, i) => {
      if (cell.letter === solutionChars[i]) {
        solutionChars[i] = '#'; 
        return { ...cell, state: 'correct' as CellState };
      }
      return cell;
    });

    // 2. Identificar presentes (Amarelo)
    const finalRow = currentRow.map((cell) => {
      if (cell.state === 'correct') return cell;

      const indexInSolution = solutionChars.indexOf(cell.letter);
      if (indexInSolution > -1) {
        solutionChars[indexInSolution] = '#'; 
        return { ...cell, state: 'present' as CellState };
      } else {
        return { ...cell, state: 'absent' as CellState };
      }
    });

    newRows[currentRowIndex] = finalRow;
    setRows(newRows);

    if (currentGuess === secretNormalized) {
      setStatus('won');
    } else if (currentRowIndex >= MAX_ATTEMPTS - 1) {
      setStatus('lost');
    } else {
      setCurrentRowIndex(prev => prev + 1);
      setCurrentColIndex(0);
    }
  };

  const triggerInvalidAnimation = () => {
    setInvalidShake(true);
    setTimeout(() => setInvalidShake(false), 500);
  };

  const selectCell = (index: number) => {
      if (status !== 'playing') return;
      if (index < wordLength && index >= 0) {
          setCurrentColIndex(index);
      }
  };

  const getKeyStyles = () => {
    const keys: Record<string, CellState> = {};
    rows.slice(0, currentRowIndex).forEach(row => {
      row.forEach(cell => {
        const currentColor = keys[cell.letter];
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
    wordLength,          // Exporta o tamanho atual
    setWordLength: startNewGame, // Função para trocar de tamanho (inicia novo jogo)
    handleKeyPress,
    startNewGame: () => startNewGame(wordLength), // Reinicia com mesmo tamanho
    keyStates: getKeyStyles(),
    selectCell,
    invalidShake
  };
};
