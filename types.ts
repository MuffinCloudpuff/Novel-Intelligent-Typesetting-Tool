export enum FormatMode {
  BASIC = 'BASIC',
  SMART_AI = 'SMART_AI'
}

export interface FormatStats {
  originalLength: number;
  formattedLength: number;
  sentencesCount: number;
}