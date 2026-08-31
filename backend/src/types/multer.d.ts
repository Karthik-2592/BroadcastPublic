declare module "multer" {
  interface File {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
  }
  interface Options {
    storage?: unknown;
    limits?: Record<string, number>;
    fileFilter?: (req: unknown, file: File, callback: (error: Error | null, accept?: boolean) => void) => void;
  }
  interface Middleware {
    array(field: string, maxCount?: number): any;
  }
  function multer(options?: Options): Middleware;
  namespace multer {
    function memoryStorage(): unknown;
  }
  export = multer;
}
