import { v4 as uuidv4 } from 'uuid';

export type FishSize = 'P' | 'M' | 'G' | 'GG';

interface WeightBySize {
  P: number;
  M: number;
  G: number;
  GG: number;
}

export interface LoteData {
  id: string;
  dataProducao: string;
  processo: string;
  fornecedor: string;
  numeroLote: string;
  numeroNF?: string;
  valorNF?: number;
  status: 'aberto' | 'em_producao' | 'finalizado';
  
  // Pesos por tamanho
  pesoNotaFiscal?: WeightBySize;
  pesoSalao?: WeightBySize;
  numBasquetas?: WeightBySize;
  
  // Filetagem por tamanho
  fileInNatura?: WeightBySize;
  fileCongelado?: WeightBySize;
  fileEmbalado?: WeightBySize;
  
  // Embalagem
  qtdMaster?: number;
  qtdSacos?: number;
  
  // Datas
  dataFabricacao?: string;
  dataValidade?: string;
  
  // Aproveitamento (calculado)
  aprovNotaFiscal?: number;
  aprovSalao?: number;
}

const createEmptyWeightBySize = (): WeightBySize => ({
  P: 0,
  M: 0,
  G: 0,
  GG: 0,
});

export const createEmptyLote = (): LoteData => ({
  id: uuidv4(),
  dataProducao: new Date().toISOString().split('T')[0],
  processo: '',
  fornecedor: '',
  numeroLote: '',
  status: 'aberto',
  pesoNotaFiscal: createEmptyWeightBySize(),
  pesoSalao: createEmptyWeightBySize(),
  numBasquetas: createEmptyWeightBySize(),
  fileInNatura: createEmptyWeightBySize(),
  fileCongelado: createEmptyWeightBySize(),
  fileEmbalado: createEmptyWeightBySize(),
});
