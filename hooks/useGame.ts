
import { useEffect, useState } from 'react';
import { getRandomWord, VALID_GUESSES } from '../constants/Words';

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
    // Escreve na célula atual
    const newRows = [...rows];
    newRows[currentRowIndex][currentColIndex] = { letter: letter.toUpperCase(), state: 'filled' };
    setRows(newRows);
    
    // Busca próximo slot vazio (Search Forward)
    let nextIndex = currentColIndex;
    let foundEmpty = false;
    
    // Testa as próximas posições (até dar a volta completa)
    for (let i = 1; i < WORD_LENGTH; i++) {
        const candidateIndex = (currentColIndex + i) % WORD_LENGTH;
        const candidateCell = newRows[currentRowIndex][candidateIndex];
        
        // Se estiver vazia (sem letra definida), é o nosso alvo
        if (!candidateCell.letter || candidateCell.state === 'empty') {
            nextIndex = candidateIndex;
            foundEmpty = true;
            break; 
        }
    }
    
    // Se encontrou vazio, move o cursor.
    // Se NÃO encontrou (palavra cheia), mantem onde está (currentColIndex),
    // permitindo que o usuário sobrescreva a letra atual se continuar digitando.
    if (foundEmpty) {
        setCurrentColIndex(nextIndex);
    }
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
    // Normalização para comparar sem acentos
    const normalize = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const currentGuess = rows[currentRowIndex].map(cell => cell.letter).join('');
    
    // Check length
    if (currentGuess.length < WORD_LENGTH || currentGuess.includes(' ')) {
      triggerInvalidAnimation();
      return;
    }

    // Valida se palavra existe na lista de PALPITES (mais ampla)
    const validWordEntry = VALID_GUESSES.find(w => normalize(w) === currentGuess);

    if (!validWordEntry) {
       triggerInvalidAnimation(); 
       return; 
    }

    const newRows = [...rows];
    // Usa a palavra da lista (com acentos) para pintar o grid corretamente? 
    // NÃO. O Termo original mantem o que o usuario digitou (sem acento)
    // Mas a validação de cores deve usar a palavra secreta (com acentos) normalizada
    
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

    // 2. Identificar presentes em lugar errado (Amarelo) e Ausentes (Cinza)
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

    // Verificar vitoria/derrota (compara normalizado)
    if (currentGuess === secretNormalized) {
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
