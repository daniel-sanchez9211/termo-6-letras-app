/**
 * Paleta de cores inspirada no Termo/Wordle
 */
const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    key: '#d3d6da',
    keyText: '#000',
    cellBorder: '#d3d6da',
    cellFilledBorder: '#878a8c',
  },
  dark: {
    text: '#fff',
    background: '#121213', // Cor exata do Wordle Dark Mode
    tint: tintColorDark,
    key: '#818384',
    keyText: '#fff',
    cellBorder: '#3a3a3c',
    cellFilledBorder: '#565758',
  },
  game: {
    correct: '#6aaa64', // Verde
    present: '#c9b458', // Amarelo
    absent: '#787c7e',  // Cinza
    correctBlind: '#f5793a', // Laranja (Modo daltônico - opcional futuro)
    presentBlind: '#85c0f9', // Azul (Modo daltônico - opcional futuro)
    error: '#ff4d4d',   // Vermelho para erros (palavra inválida)
  },
};
