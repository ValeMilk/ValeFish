import { Schema, model } from 'mongoose';

interface WeightBySize {
  P: number;
  M: number;
  G: number;
  GG: number;
}

interface CustoTotal {
  pacote: number;
  kg: number;
  caixa: number;
}

interface ILote {
  dataProducao: string;
  processo: string;
  fornecedor: string;
  numeroLote: string;
  numeroNF?: string;
  valorNF?: number;
  
  pesoNotaFiscal?: WeightBySize;
  pesoSalao?: WeightBySize;
  numBasquetas?: WeightBySize;
  
  fileInNatura?: WeightBySize;
  fileCongelado?: WeightBySize;
  fileEmbalado?: WeightBySize;
  descartes?: WeightBySize;
  
  tipoFile?: '400g' | '800g';
  caixas?: number;
  pacotes?: number;
  qtdMaster?: number;
  qtdSacos?: number;
  dataFabricacao?: string;
  dataValidade?: string;
  
  aprovNotaFiscal?: number;
  aprovSalao?: number;
  
  custoTotal?: CustoTotal;
  
  status: 'aberto' | 'em_producao' | 'finalizado';
  createdAt: Date;
  updatedAt: Date;
}

const weightBySize = {
  P: { type: Number, default: 0 },
  M: { type: Number, default: 0 },
  G: { type: Number, default: 0 },
  GG: { type: Number, default: 0 },
};

const loteSchema = new Schema<ILote>(
  {
    dataProducao: {
      type: String,
      required: true,
    },
    processo: {
      type: String,
      required: true,
    },
    fornecedor: {
      type: String,
      required: true,
      enum: ['VALEFISH', 'NORFISH', 'CARLITO'],
    },
    numeroLote: {
      type: String,
      required: true,
    },
    numeroNF: String,
    valorNF: Number,
    
    pesoNotaFiscal: weightBySize,
    pesoSalao: weightBySize,
    numBasquetas: weightBySize,
    
    fileInNatura: weightBySize,
    fileCongelado: weightBySize,
    fileEmbalado: weightBySize,
    descartes: weightBySize,
    
    tipoFile: {
      type: String,
      enum: ['400g', '800g'],
    },
    caixas: Number,
    pacotes: Number,
    qtdMaster: Number,
    qtdSacos: Number,
    dataFabricacao: String,
    dataValidade: String,
    
    aprovNotaFiscal: Number,
    aprovSalao: Number,
    
    custoTotal: {
      pacote: { type: Number, default: 0 },
      kg: { type: Number, default: 0 },
      caixa: { type: Number, default: 0 },
    },
    
    status: {
      type: String,
      enum: ['aberto', 'em_producao', 'finalizado'],
      default: 'aberto',
    },
  },
  { timestamps: true }
);

export const Lote = model<ILote>('Lote', loteSchema);
