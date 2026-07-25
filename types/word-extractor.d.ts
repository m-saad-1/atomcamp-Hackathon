declare module 'word-extractor' {
  class WordExtractor {
    extract(buffer: Buffer): Promise<Document>;
  }
  
  class Document {
    getBody(): string;
  }
  
  export = WordExtractor;
}
