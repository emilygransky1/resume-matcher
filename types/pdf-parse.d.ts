declare module 'pdf-parse' {
  interface PDFData {
    text: string;
    numpages: number;
    info: any;
    metadata: any;
    version: string;
  }

  function parse(buffer: Buffer | ArrayBuffer): Promise<PDFData>;
  export = parse;
} 