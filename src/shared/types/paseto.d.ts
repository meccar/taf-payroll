declare module 'paseto' {
  export type PasetoVerifyOptions = {
    audience?: string | string[];
    issuer?: string;
    clockTolerance?: string | number;
  };

  export const V4: {
    verify: (
      token: string,
      key: Uint8Array | Buffer,
      options?: PasetoVerifyOptions,
    ) => Promise<unknown>;
  };
}
