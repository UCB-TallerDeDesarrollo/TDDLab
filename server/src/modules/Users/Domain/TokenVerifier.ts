export interface TokenVerifier {
  verifyAndExtractEmail(idToken: string): Promise<string>;
}

