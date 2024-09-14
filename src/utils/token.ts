import jwt from "jsonwebtoken";

class Token {
  private secret: string;
  constructor() {
    this.secret = process.env.TOKEN_SECRET as string;
  }
  public jwtSign(payload: any): string {
    const token = jwt.sign(payload, this.secret, {
      expiresIn: "30d",
    });
    return token;
  }

  public jwtVerify(token: string): any {
    // const decoded = jwt.verify(token, this.secret) as any;
    const decoded: any = jwt.decode(token, { complete: true });
    return decoded;
  }
}

export default Token;
