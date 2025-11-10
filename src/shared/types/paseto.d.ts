declare module 'paseto' {
  export type PasetoVerifyOptions = {
    audience?: string | string[];
    issuer?: string;
    clockTolerance?: string | number;
  };

  export type PasetoSignOptions = {
    audience?: string | string[];
    issuer?: string;
    expiresIn?: string | number;
    footer?: string | Buffer;
    assertion?: string | Buffer;
  };

  export const V4: {
    verify: (
      token: string,
      key: Uint8Array | Buffer,
      options?: PasetoVerifyOptions,
    ) => Promise<unknown>;
    sign: (
      payload: Record<string, unknown>,
      key: Uint8Array | Buffer,
      options?: PasetoSignOptions,
    ) => Promise<string>;
  };
}
