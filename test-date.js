// Teste de conversão de datas
console.log('=== TESTE DE CONVERSÃO DE DATAS ===\n');

const dataString = '2026-01-28';
console.log('Data armazenada:', dataString);
console.log('');

// Método 1: new Date() com string
const date1 = new Date(dataString);
console.log('new Date("2026-01-28"):');
console.log('  - toLocaleDateString("pt-BR"):', date1.toLocaleDateString('pt-BR'));
console.log('  - toString():', date1.toString());
console.log('');

// Método 2: new Date() com string + horário
const date2 = new Date(dataString + 'T00:00:00');
console.log('new Date("2026-01-28T00:00:00"):');
console.log('  - toLocaleDateString("pt-BR"):', date2.toLocaleDateString('pt-BR'));
console.log('');

// Método 3: Split manual (sem conversão de timezone)
const [ano, mes, dia] = dataString.split('-');
console.log('Split manual (sem timezone):');
console.log('  -', `${dia}/${mes}/${ano}`);
console.log('');

console.log('=== CONCLUSÃO ===');
console.log('Quando usamos new Date() com uma data no formato YYYY-MM-DD,');
console.log('o JavaScript assume que é UTC e pode ajustar para o timezone local,');
console.log('causando mudança de dia quando o timezone é negativo (ex: -03:00).');
